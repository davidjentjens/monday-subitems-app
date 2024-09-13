import { debounce } from 'lodash'
import { EditableText } from 'monday-ui-react-core'
import { useCallback, useState } from 'react'
import { Subitem } from 'src/interfaces'
import { monday } from 'src/services'

interface TextCellProps {
  boardId: number | null
  subitem: Subitem
  columnId: string
}

export const TextCell: React.FC<TextCellProps> = ({
  boardId,
  subitem,
  columnId,
}) => {
  const [text, setText] = useState<string>(subitem[columnId]?.value ?? '')

  const updateSubitemCell = async (value: string) => {
    // Assuming monday.api is a function to update the Monday table
    await monday.api(`
      mutation {
        change_simple_column_value(board_id: ${boardId}, item_id: ${subitem.id}, column_id: "${columnId}", value: "${value}") {
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
