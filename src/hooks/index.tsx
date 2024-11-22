// Create a context wrapper out of the useStatusMap and useUserData hooks.

import { ReactNode } from 'react'

import { StatusMapProvider } from './useStatusMap'
import { UserDataProvider } from './useUserData'

interface SubitemsProviderProps {
  boardId: number
  columnIds: string[]
  children: ReactNode
}

export const SubitemsProvider = ({
  boardId,
  columnIds,
  children,
}: SubitemsProviderProps) => {
  return (
    <UserDataProvider boardId={boardId}>
      <StatusMapProvider boardId={boardId} columnIds={columnIds}>
        {children}
      </StatusMapProvider>
    </UserDataProvider>
  )
}
