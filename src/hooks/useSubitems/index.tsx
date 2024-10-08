import { useCallback, useEffect, useState } from 'react'
import { Subitem, SubitemColumn } from 'src/interfaces'
import { monday } from 'src/services'

import { useToast } from '../useToast'

export const SUPPORTED_COLUMN_TYPES = [
  'name',
  'text',
  'status',
  'people',
  'delete',
  'numbers',
]

const useSubitems = (parentItemId: number) => {
  const { addToast, removeToast } = useToast()

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
                                    settings_str
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
          .filter((columnValue: any) =>
            SUPPORTED_COLUMN_TYPES.includes(columnValue.type),
          )
          .map(
            (columnValue: any): SubitemColumn => ({
              id: columnValue.id,
              title: columnValue.column.title,
              type: columnValue.type,
              settings: JSON.parse(columnValue.column.settings_str),
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
    if (!newSubitemName) {
      addToast({
        message: 'Name cannot be empty',
        type: 'negative',
        timeToLive: 1000,
      })
      return
    }

    const toastId = addToast({
      message: 'Adding subitem...',
      type: 'positive',
      loading: true,
    })
    try {
      setNewSubitemName('')
      const { data } = await monday.api(
        `mutation {
            create_subitem (parent_item_id: ${parentItemId}, item_name: "${newSubitemName}") {
                id
            }
        }`,
      )

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      await loadTable()
      removeToast(toastId)
      addToast({
        message: 'Subitem added successfully',
        type: 'positive',
        timeToLive: 1000,
      })
    } catch (error) {
      addToast({
        message: 'Error adding subitem. Please try again or contact support.',
        type: 'negative',
        timeToLive: 2000,
      })
      console.error('Error adding subitem:', error)
    }
  }, [addToast, loadTable, newSubitemName, parentItemId, removeToast])

  const deleteSubitem = useCallback(
    async (subItemId: string) => {
      const toastId = addToast({
        message: 'Deleting subitem...',
        type: 'positive',
        loading: true,
      })
      try {
        const { data } = await monday.api(`
          mutation {
            delete_item (item_id: ${subItemId}) {
              id
            }
          }
        `)

        if (data.errors) {
          throw new Error(data.errors[0].message)
        }

        await loadTable()
        removeToast(toastId)
        addToast({
          message: 'Subitem deleted successfully',
          type: 'positive',
          timeToLive: 1000,
        })
      } catch (error) {
        addToast({
          message:
            'Error deleting subitem. Please try again or contact support.',
          type: 'negative',
          timeToLive: 2000,
        })
        console.error('Error deleting subitem:', error)
      }
    },
    [addToast, loadTable, removeToast],
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
