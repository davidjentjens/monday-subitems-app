import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import CustomInput from 'src/components/CustomInput'
import { CellProps, NumberSettings, SubitemColumn } from 'src/interfaces'
import { monday } from 'src/services'

interface NumbersCellProps extends CellProps {
  columns: SubitemColumn[]
}

export const NumbersCell: React.FC<NumbersCellProps> = ({
  boardId,
  selectedValue,
  subItemId,
  columnId,
  columns,
}) => {
  const [number, setNumber] = useState<string>(selectedValue || '')
  const [numberSettings, setNumberSettings] = useState<
    NumberSettings | undefined
  >()

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
    setNumber(value)
    debouncedUpdate(value)
  }

  useEffect(() => {
    const column = columns.find((column) => column.id === columnId)
    if (column) {
      setNumberSettings(column.settings)
    }
  }, [columns, columnId])

  return (
    <CustomInput
      type="number"
      value={number}
      numberSettings={numberSettings}
      onChange={handleChange}
    />
  )
}
