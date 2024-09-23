import React, { createContext, ReactNode, useContext } from 'react'
import { StatusMapState } from 'src/interfaces'

import { useStatusMap } from './'

interface StatusMapContextProps {
  statusMapStates: StatusMapState[]
}

const StatusMapContext = createContext<StatusMapContextProps | undefined>(
  undefined,
)

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

export const useStatusMapContext = () => {
  const context = useContext(StatusMapContext)
  if (!context) {
    throw new Error(
      'useStatusMapContext must be used within a StatusMapProvider',
    )
  }
  return context
}
