import {
  Dialog,
  DialogContentContainer,
  Flex,
  Skeleton,
} from 'monday-ui-react-core'
import { useMemo, useState } from 'react'
import { useStatusMapContext } from 'src/hooks/useStatusMap'
import { useToast } from 'src/hooks/useToast'
import { CellProps } from 'src/interfaces'
import { monday } from 'src/services'

import { StatusButton } from './components/StatusButton'

export const StatusCell: React.FC<CellProps> = ({
  boardId,
  selectedValue,
  subItemId,
  columnId,
}) => {
  const { addToast } = useToast()

  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const [statusId, setStatusId] = useState<string>(selectedValue)

  const openDialog = () => setDialogIsOpen(true)
  const closeDialog = () => setDialogIsOpen(false)
  const changeStatus = (newStatusId: string) => {
    const updateStatus = async () => {
      await monday.execute('valueCreatedForUser')

      const previousStatusId = statusId

      try {
        setStatusId(newStatusId)
        const { data } = await monday.api(`mutation {
          change_column_value(
            board_id: ${boardId},
            item_id: ${subItemId},
            column_id: "${columnId}",
            value: "{\\"index\\":${newStatusId}}"
          ) {
            id
          }
        }`)

        if (data.errors) {
          throw new Error(data.errors[0].message)
        }
      } catch (error) {
        setStatusId(previousStatusId)
        addToast({
          message:
            'Error updating status. Please try again or contact support.',
          type: 'negative',
          timeToLive: 2000,
        })
        console.error('Error updating status:', error)
      }
    }

    updateStatus()
    closeDialog()
  }

  const { statusMapStates } = useStatusMapContext()

  const statusMapState = useMemo(() => {
    const currentStatusMapState = statusMapStates.find(
      (state) => state.columnId === columnId,
    )

    return currentStatusMapState
  }, [statusMapStates, columnId])

  const orderedStatuses = useMemo(() => {
    if (statusMapState === undefined) return []

    if (statusMapState.positions === undefined) {
      return Object.entries(statusMapState.statusMap)
    }

    // Order the statuses by the statusMapState.positions map
    return Object.entries(statusMapState.statusMap).sort(
      ([aIndex], [bIndex]) => {
        return (
          statusMapState.positions[Number(aIndex)] -
          statusMapState.positions[Number(bIndex)]
        )
      },
    )
  }, [statusMapState])

  if (statusMapState === undefined) {
    return <Skeleton height={30} width={150} />
  }

  return (
    <Dialog
      open={dialogIsOpen}
      showTrigger={[]}
      onClickOutside={closeDialog}
      position={'bottom' as any}
      content={
        <DialogContentContainer>
          <Flex
            wrap
            direction={Flex.directions.COLUMN}
            gap={Flex.gaps.SMALL}
            style={{ maxHeight: 800 }}
          >
            {orderedStatuses.map(([id]) => (
              <StatusButton
                key={id}
                statusId={id}
                statusMap={statusMapState.statusMap}
                onClick={() => changeStatus(id)}
              />
            ))}
          </Flex>
        </DialogContentContainer>
      }
      tooltip
    >
      <StatusButton
        statusId={statusId}
        statusMap={statusMapState.statusMap}
        onClick={openDialog}
      />
    </Dialog>
  )
}
