import React, { useEffect, useState } from 'react'

import SubitemsViewer from './components/SubitemsViewer'
import { monday } from './services'

const App: React.FC = () => {
  const [parentItemId, setParentItemId] = useState<number | null>(7259116397)

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
      <h1>Monday Subitems Widget</h1>
      {parentItemId === null ? (
        <p>Loading...</p>
      ) : (
        <SubitemsViewer parentItemId={parentItemId} />
      )}
    </div>
  )
}

export default App
