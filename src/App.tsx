import { Table, Text } from 'monday-ui-react-core'
import React, { useEffect, useState } from 'react'

import SubitemsViewer from './components/SubitemsViewer'
import { monday } from './services'

// Type definitions
interface ContextData {
  itemId: number
  user: {
    isViewOnly: boolean
  }
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

  const [isViewMode, setIsViewMode] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const initializeApp = async () => {
      try {
        const unsubscribe = monday.listen('context', (res: MondayContext) => {
          console.log('Context:', res)

          if (!isMounted) return

          const itemId = res.data?.itemId
          const isViewMode = res.data?.user.isViewOnly

          if (itemId) {
            setParentItemId(itemId)
          }
          if (isViewMode) {
            setIsViewMode(isViewMode)
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

  if (isViewMode) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          minHeight: '20vh',
        }}
      >
        <Text align={Text.align.CENTER}>
          As a viewer, you are unable to use the app Better Subitems
        </Text>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          minHeight: '20vh',
        }}
      >
        <Text align={Text.align.CENTER}>Unexpected Error: {error}</Text>{' '}
      </div>
    )
  }

  if (isLoading || !parentItemId) {
    return <LoadingState />
  }

  return <SubitemsViewer parentItemId={parentItemId} />
}

export default App
