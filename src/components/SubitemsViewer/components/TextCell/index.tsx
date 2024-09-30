import { debounce } from 'lodash'
import { EditableText } from 'monday-ui-react-core'
import { useCallback, useState } from 'react'
import { CellProps } from 'src/interfaces'
import { monday } from 'src/services'

export const TextCell: React.FC<CellProps> = ({
  boardId,
  selectedValue,
  subItemId,
  columnId,
}) => {
  const [text, setText] = useState<string>(selectedValue)

  const updateSubitemCell = async (value: string) => {
    await monday.api(`
      mutation {
        change_simple_column_value(board_id: ${boardId}, item_id: ${subItemId}, column_id: "${columnId}", value: "${value}") {
          id
        }
      }
    `)
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

  return <EditableText value={text} onChange={handleChange} />
}
