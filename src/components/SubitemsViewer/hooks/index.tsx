// Create a context wrapper out of the useStatusMap and useUserData hooks.

import { ReactNode } from 'react'

import { StatusMapProvider } from './useStatusMap/context'
import { UserDataProvider } from './useUserData'

interface AppProviderProps {
  boardId: number
  columnIds: string[]
  children: ReactNode
}

export const AppProvider = ({
  boardId,
  columnIds,
  children,
}: AppProviderProps) => {
  return (
    <UserDataProvider boardId={boardId}>
      <StatusMapProvider boardId={boardId} columnIds={columnIds}>
        {children}
      </StatusMapProvider>
    </UserDataProvider>
  )
}
