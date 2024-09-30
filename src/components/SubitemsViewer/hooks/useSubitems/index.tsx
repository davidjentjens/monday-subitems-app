import { useCallback, useEffect, useState } from 'react'
import { Subitem, SubitemColumn } from 'src/interfaces'
import { monday } from 'src/services'

export const SUPPORTED_COLUMN_TYPES = [
  'name',
  'text',
  'status',
  'people',
  'delete',
]

const useSubitems = (parentItemId: number) => {
  const [boardId, setBoardId] = useState<number | null>(null)

  const [subitems, setSubitems] = useState<Subitem[]>([])
  const [columns, setColumns] = useState<SubitemColumn[]>([])

  const [loading, setLoading] = useState(false)

  const [newSubitemName, setNewSubitemName] = useState('')
  const onNewSubitemNameChange = (value: string) => {
    setNewSubitemName(value)
  }

  const fetchSubitemColumns = useCallback(async () => {
    setLoading(true)
    const query = `
                query {
                    items(ids: ${parentItemId}) {
                        subitems {
                            name
                            column_values {
                                id
                                type
                                column {
                                    title
                                }
                            }
                        }
                    }
                }
            `
    try {
      const response = await monday.api(query)

      if (!response.data.items[0].subitems[0]) {
        setColumns([])
        setLoading(false)
        return
      }

      const columns: SubitemColumn[] =
        response.data.items[0].subitems[0].column_values
          .filter((column: any) => SUPPORTED_COLUMN_TYPES.includes(column.type))
          .map(
            (column: any): SubitemColumn => ({
              id: column.id,
              title: column.column.title,
              type: column.type,
            }),
          )
      columns.unshift({
        id: 'name',
        title: 'Name',
        type: 'name',
        value: response.data.items[0].subitems[0].name,
      })
      columns.push({
        id: 'delete',
        title: '',
        type: 'delete',
        width: '100px',
      })
      setColumns(columns)
    } catch (error) {
      console.error('Failed to fetch subitem columns:', error)
    }
    setLoading(false)
  }, [parentItemId])

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

      console.log(response.data.items)

      if (!response.data.items[0]) {
        console.error('No items found')
        return
      }

      if (response.data.items[0].subitems.length === 0) {
        setSubitems([])
        setLoading(false)
        return
      }

      setBoardId(response.data.items[0].subitems[0].board.id)

      if (response.data.items[0].subitems.length === 0) {
        setLoading(false)
        setSubitems([])
        return
      }

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

  const loadTable = useCallback(async () => {
    await Promise.all([fetchSubitems(), fetchSubitemColumns()])
  }, [fetchSubitemColumns, fetchSubitems])

  const addSubitem = useCallback(async () => {
    if (!newSubitemName) return
    setLoading(true)
    try {
      setNewSubitemName('')
      await monday.api<{
        data: { create_subitem: { id: string } }
      }>(
        `mutation {
            create_subitem (parent_item_id: ${parentItemId}, item_name: "${newSubitemName}") {
                id
            }
        }`,
      )
      await loadTable()
    } catch (error) {
      console.error('Error adding subitem:', error)
    }
    setLoading(false)
  }, [loadTable, newSubitemName, parentItemId])

  const deleteSubitem = useCallback(
    async (subItemId: string) => {
      setLoading(true)
      try {
        await monday.api(`
          mutation {
            delete_item (item_id: ${subItemId}) {
              id
            }
          }
        `)
        setSubitems((prevSubitems) =>
          prevSubitems.filter((subitem) => subitem.id !== subItemId),
        )
        await loadTable()

        // If there are no subitems left, remove the columns
        if (subitems.length === 0) {
          setColumns([])
        }
      } catch (error) {
        console.error('Error deleting subitem:', error)
      }
      setLoading(false)
    },
    [loadTable, subitems.length],
  )

  useEffect(() => {
    loadTable()
  }, [loadTable, parentItemId])

  return {
    boardId,
    subitems,
    columns,
    loading,
    fetchSubitems,
    addSubitem,
    deleteSubitem,
    newSubitemName,
    onNewSubitemNameChange,
  }
}

export default useSubitems
