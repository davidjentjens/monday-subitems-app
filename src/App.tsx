import { AlertTriangle } from 'lucide-react'
import { Table, Text, ThemeProvider } from 'monday-ui-react-core'
import React, { useEffect, useState } from 'react'

import SubitemsViewer from './components/SubitemsViewer'
import { ThemeConfig } from './interfaces'
import { monday } from './services'

// Type definitions
interface ContextData {
  itemId: number
  themeConfig: ThemeConfig
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

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [context, setContext] = useState<ContextData | null>({
    itemId: 0,
    themeConfig: {
      name: 'Default',
      colors: {
        black: {
          'primary-color': '#000000',
          'primary-hover-color': '#000000',
          'primary-selected-color': '#000000',
          'primary-selected-hover-color': '#000000',
        },
        dark: {
          'primary-color': '#000000',
          'primary-hover-color': '#000000',
          'primary-selected-color': '#000000',
          'primary-selected-hover-color': '#000000',
        },
        light: {
          'primary-color': '#000000',
          'primary-hover-color': '#000000',
          'primary-selected-color': '#000000',
          'primary-selected-hover-color': '#000000',
        },
      },
    },
    user: {
      isViewOnly: false,
    },
  })

  useEffect(() => {
    let isMounted = true

    const initializeApp = async () => {
      try {
        const unsubscribe = monday.listen('context', (res: MondayContext) => {
          console.log('Context:', res)

          if (!isMounted) return

          const itemId = res.data?.itemId
          if (itemId) {
            setParentItemId(itemId)
          }

          setContext(res.data)
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

  if (context?.user.isViewOnly) {
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

  if (!context) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          minHeight: '20vh',
          gap: '10px',
        }}
      >
        <AlertTriangle />
        <Text align={Text.align.CENTER}>
          No context data available. Please try again later. If the issue
          persists, contact support.
        </Text>
      </div>
    )
  }

  return (
    <ThemeProvider themeConfig={context?.themeConfig}>
      {isLoading || !parentItemId ? (
        <LoadingState />
      ) : (
        <SubitemsViewer parentItemId={parentItemId} />
      )}
    </ThemeProvider>
  )
}

export default App
