import { useEffect, useState } from 'react'
import { SubitemColumn } from 'src/interfaces'
import { monday } from 'src/services'

import { SUPPORTED_COLUMN_TYPES } from '..'

const useSubitemColumns = (parentItemId: number) => {
  const [subitemColumns, setSubitemColumns] = useState<SubitemColumn[]>([])
  const [loading, setLoading] = useState(false)

  const getColumnWidth = (column: SubitemColumn) => {
    switch (column.type) {
      case 'status':
        return '0.25fr'
      case 'people':
        return '0.15fr'
      case 'text':
        return '0.2fr'
      default:
        return '0.2fr'
    }
  }

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
                width: getColumnWidth(column),
              }),
            )
        columns.unshift({
          id: 'name',
          title: 'Name',
          type: 'name',
          value: response.data.items[0].subitems[0].name,
          width: { min: '500px', max: '0.3fr' },
        })
        columns[columns.length - 1].width = { min: '200px', max: '1fr' }
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
