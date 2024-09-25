import { useEffect, useState } from 'react'
import { SubitemColumn } from 'src/interfaces'
import { monday } from 'src/services'

import { SUPPORTED_COLUMN_TYPES } from '..'

const useSubitemColumns = (parentItemId: number) => {
  const [subitemColumns, setSubitemColumns] = useState<SubitemColumn[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSubitemColumns = async () => {
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
        const columns: SubitemColumn[] =
          response.data.items[0].subitems[0].column_values
            .filter((column: any) =>
              SUPPORTED_COLUMN_TYPES.includes(column.type),
            )
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
        setSubitemColumns(columns)
      } catch (error) {
        console.error('Failed to fetch subitem columns:', error)
      }
      setLoading(false)
    }

    fetchSubitemColumns()
  }, [parentItemId])

  return {
    subitemColumns,
    loading,
  }
}

export default useSubitemColumns
