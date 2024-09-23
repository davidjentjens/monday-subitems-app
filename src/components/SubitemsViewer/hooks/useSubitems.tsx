import { useCallback, useEffect, useState } from 'react'
import { Subitem } from 'src/interfaces'
import { monday } from 'src/services'

import { SUPPORTED_COLUMN_TYPES } from '../'

const useSubitems = (parentItemId: number) => {
  const [boardId, setBoardId] = useState<number | null>(null)
  const [subitems, setSubitems] = useState<Subitem[]>([])
  const [loading, setLoading] = useState(false)
  const [newSubitemName, setNewSubitemName] = useState('')

  const onNewSubitemNameChange = (value: string) => {
    setNewSubitemName(value)
  }

  const fetchSubitems = useCallback(async () => {
    setLoading(true)
    const query = `
            query {
                items(ids: ${parentItemId}) {
                    subitems {
                        board {
                            id
                        }
                        id
                        name
                        column_values {
                            id
                            type
                            value
                        }
                    }
                }
            }
        `
    try {
      const response = await monday.api(query)

      if (!response.data.items[0]) {
        console.error('No items found')
        return
      }

      setBoardId(response.data.items[0].subitems[0].board.id)

      const items: Subitem[] = response.data.items[0].subitems.map(
        (subitem: any): Subitem => ({
          id: subitem.id,
          name: subitem.name,
          ...subitem.column_values
            // Filter out unsupported column types
            .filter((column: any) =>
              SUPPORTED_COLUMN_TYPES.includes(column.type),
            )
            // Convert column values to JSON, and add them to the subitem object
            .reduce((acc: any, column: any) => {
              acc[column.id] = {
                ...column,
                value: JSON.parse(column.value),
              }
              return acc
            }, {}),
        }),
      )
      setSubitems(items)
    } catch (error) {
      console.error('Failed to fetch subitems:', error)
    }
    setLoading(false)
  }, [parentItemId])

  const addSubitem = useCallback(async () => {
    if (!newSubitemName) return
    setLoading(true)
    try {
      setNewSubitemName('')
      await monday.api<{ data: { create_subitem: { id: string } } }>(
        `mutation {
            create_subitem (parent_item_id: ${parentItemId}, item_name: "${newSubitemName}") {
                id
            }
        }`,
      )
      fetchSubitems()
    } catch (error) {
      console.error('Error adding subitem:', error)
    }
    setLoading(false)
  }, [fetchSubitems, newSubitemName, parentItemId])

  useEffect(() => {
    fetchSubitems()
  }, [fetchSubitems, parentItemId])

  return {
    boardId,
    subitems,
    loading,
    fetchSubitems,
    addSubitem,
    newSubitemName,
    onNewSubitemNameChange,
  }
}

export default useSubitems
