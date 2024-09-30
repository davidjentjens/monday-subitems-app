import { Table } from 'monday-ui-react-core'
import React, { useEffect, useState } from 'react'

import SubitemsViewer from './components/SubitemsViewer'
import { monday } from './services'

const App: React.FC = () => {
  const [parentItemId, setParentItemId] = useState<number | null>(7340188171)

  useEffect(() => {
    const unsubscribe = monday.listen('context', (res) => {
      console.log('Context data:', res)
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
    <div>
      {parentItemId === null ? (
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
    </div>
  )
}

export default App
