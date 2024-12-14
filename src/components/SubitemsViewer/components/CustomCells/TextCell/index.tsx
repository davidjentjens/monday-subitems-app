import { debounce } from 'lodash'
import { ExpandIcon } from 'lucide-react'
import { IconButton } from 'monday-ui-react-core'
import { useCallback, useState } from 'react'
import CustomInput from 'src/components/CustomInput'
import { CellProps } from 'src/interfaces'
import { monday } from 'src/services'

export const TextCell: React.FC<CellProps> = ({
  isNameColumn,
  boardId,
  selectedValue,
  subItemId,
  columnId,
}) => {
  const [text, setText] = useState<string>(selectedValue || '')

  const updateSubitemCell = async (value: string) => {
    await monday.api(`
      mutation {
        change_simple_column_value(board_id: ${boardId}, item_id: ${subItemId}, column_id: "${columnId}", value: "${value}") {
          id
        }
      }
    `)

    await monday.execute('valueCreatedForUser')
  }

  const debouncedUpdate = useCallback(
    debounce((value: string) => {
      updateSubitemCell(value)
    }, 500),
    [],
  )

  const handleChange = (value: string) => {
    setText(value)
    debouncedUpdate(value)
  }

  const navigateToSubitem = async () => {
    const { data } = await monday.api(`query {
      boards (limit:1)  {
        owner {
          account {
            slug
          }
        }
    }}`)

    const slug = data.boards[0].owner.account.slug

    const subItemUrl = `https://${slug}.monday.com/boards/${boardId}/pulses/${subItemId}`

    window.open(subItemUrl, '_blank')
  }

  return (
    <>
      <CustomInput value={text} onChange={handleChange} />
      {isNameColumn && (
        <>
          <div style={{ width: 2 }} />
          <IconButton
            icon={ExpandIcon}
            tooltipContent="Open subitem"
            onClick={navigateToSubitem}
          />
        </>
      )}
    </>
  )
}
