import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { StatusColumn, StatusMapState, StatusProps } from 'src/interfaces'
import { monday } from 'src/services'

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

interface StatusMapContextProps {
  statusMapStates: StatusMapState[]
}

const StatusMapContext = createContext<StatusMapContextProps | undefined>(
  undefined,
)

export const useStatusMapContext = () => {
  const context = useContext(StatusMapContext)
  if (!context) {
    throw new Error(
      'useStatusMapContext must be used within a StatusMapProvider',
    )
  }
  return context
}

interface StatusMapProviderProps {
  boardId: number | null
  columnIds: string[]
  children: ReactNode
}

export const StatusMapProvider: React.FC<StatusMapProviderProps> = ({
  boardId,
  columnIds,
  children,
}) => {
  const statusMapStates = useStatusMap(boardId, columnIds)

  return (
    <StatusMapContext.Provider value={{ statusMapStates }}>
      {children}
    </StatusMapContext.Provider>
  )
}
