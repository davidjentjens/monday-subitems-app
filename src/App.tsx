import { Table } from 'monday-ui-react-core'
import React, { useEffect, useState } from 'react'

import SubitemsViewer from './components/SubitemsViewer'
import { ToastProvider } from './hooks/useToast'
import { monday } from './services'

// Type definitions
interface ContextData {
  itemId: number
  data?: unknown
}

interface MondayContext {
  data: ContextData
}

const LoadingState: React.FC = () => (
  <Table
    dataState={{
      isLoading: true,
    }}
    columns={[]}
    errorState={<div>Error loading data</div>}
    emptyState={<div>No data available</div>}
  />
)

const App: React.FC = () => {
  const [parentItemId, setParentItemId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const initializeApp = async () => {
      try {
        // Initialize with default ID if needed
        setParentItemId(7552836936)

        const unsubscribe = monday.listen('context', (res: MondayContext) => {
          console.log('Context:', res)

          if (!isMounted) return

          const itemId = res.data?.itemId

          if (itemId) {
            setParentItemId(itemId)
          }
        })

        setIsLoading(false)

        return () => {
          isMounted = false
          unsubscribe()
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred')
          setIsLoading(false)
        }
      }
    }

    initializeApp()
  }, [])

  if (error) {
    return (
      <ToastProvider>
        <div className="p-4 text-red-600">Error: {error}</div>
      </ToastProvider>
    )
  }

  if (isLoading || !parentItemId) {
    return (
      <ToastProvider>
        <LoadingState />
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      <SubitemsViewer parentItemId={parentItemId} />
    </ToastProvider>
  )
}

export default App
