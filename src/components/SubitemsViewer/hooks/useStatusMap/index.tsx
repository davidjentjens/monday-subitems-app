import { useEffect, useState } from 'react'
import { StatusMapState } from 'src/interfaces'
import { monday } from 'src/services'

interface StatusColumn {
  id: string
  settings_str: string
}

interface StatusProps {
  name: string
  colorSettings: {
    color: string
    border: string
  }
}

export const useStatusMap = (boardId: number | null, columnIds: string[]) => {
  const [statusMapStates, setStatusMapStates] = useState<StatusMapState[]>([])

  useEffect(() => {
    const fetchStatusMap = async (columnIds: string[]) => {
      try {
        const response = await monday.api(`
          query {
            boards(ids: ${boardId}) {
              columns(ids: ["${columnIds.join('","')}"]) {
                id
                settings_str
              }
            }
          }
        `)

        const columns = response.data.boards[0].columns as StatusColumn[]

        const statusMapStates = await Promise.all(
          columns.map(async (column: any) => {
            const settings = JSON.parse(column.settings_str)

            const statuses = settings.labels
            const colors = settings.labels_colors
            const positions = settings.labels_positions_v2

            const fetchedStatusMap = Object.keys(statuses).reduce(
              (acc, key) => {
                acc[parseInt(key)] = {
                  name: statuses[key],
                  colorSettings: colors[key],
                }
                return acc
              },
              {} as { [key: number]: StatusProps },
            )

            return {
              columnId: column.id,
              statusMap: fetchedStatusMap,
              positions,
              loading: false,
            }
          }),
        )

        setStatusMapStates(statusMapStates)
      } catch (error) {
        console.error('Error fetching status map:', error)
      }
    }

    if (columnIds.length > 0 && boardId) {
      fetchStatusMap(columnIds)
    }
  }, [columnIds, boardId])

  return statusMapStates
}
