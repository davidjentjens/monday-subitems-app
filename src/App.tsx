import { Table } from 'monday-ui-react-core'
import React, { useEffect, useState } from 'react'

import SubitemsViewer from './components/SubitemsViewer'
import { ToastProvider } from './hooks/useToast'
import { monday } from './services'

const App: React.FC = () => {
  const [parentItemId, setParentItemId] = useState<number | null>(7552836936)

  useEffect(() => {
    const unsubscribe = monday.listen('context', (res) => {
      // console.log('Context data:', res)
      const itemId = (res.data as any)?.itemId

      if (itemId) {
        setParentItemId(itemId)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <ToastProvider>
      {!parentItemId ? (
        <Table
          dataState={{
            isLoading: true,
          }}
          columns={[]}
          errorState={<></>}
          emptyState={<></>}
        />
      ) : (
        <SubitemsViewer parentItemId={parentItemId} />
      )}
    </ToastProvider>
  )
}

export default App
