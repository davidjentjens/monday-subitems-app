import DOMPurify from 'dompurify'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MondayEvent, Subitem, SubitemColumn } from 'src/interfaces'
import { monday } from 'src/services'

import { useToast } from '../useToast'
import { subitemApi } from './api'

interface UseSubitemsProps {
  boardId: number
  parentItemId: number
}

interface SubitemsState {
  subitems: Subitem[]
  columns: SubitemColumn[]
  loading: boolean
}

const shouldRefreshOnEvent = (
  event: Record<string, any> & MondayEvent,
  parentItemId: number,
  boardId: number,
  subitemIds: Set<string>,
): boolean => {
  const eventType = event.type
  const eventItemId = event.itemId?.toString()
  const pulseId = event.pulseId?.toString()
  const targetBoardId = event.boardId

  if (targetBoardId && targetBoardId !== boardId) {
    return false
  }

  switch (eventType) {
    case 'create_subitem':
      return event.parentItemId?.toString() === parentItemId.toString()
    case 'delete_subitem':
    case 'update_subitem':
      return subitemIds.has(eventItemId) || subitemIds.has(pulseId)
    default:
      return false
  }
}

const shouldRefreshOnItemChange = (
  changedItemIds: number[],
  parentItemId: number,
  subitemIds: Set<string>,
): boolean => {
  const parentIdStr = parentItemId.toString()
  return changedItemIds.some(
    (id) => id.toString() === parentIdStr || subitemIds.has(id.toString()),
  )
}

const useSubitems = ({ boardId, parentItemId }: UseSubitemsProps) => {
  const { addToast, removeToast } = useToast()
  const subitemIdsRef = useRef<Set<string>>(new Set())
  const [state, setState] = useState<SubitemsState>({
    subitems: [],
    columns: [],
    loading: false,
  })

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }))
  }, [])

  const loadTable = useCallback(async () => {
    setLoading(true)
    try {
      const [columns, { items }] = await Promise.all([
        subitemApi.fetchColumns(parentItemId),
        subitemApi.fetchSubitems(parentItemId),
      ])

      setState((prev) => ({
        ...prev,
        columns,
        subitems: items,
        loading: false,
      }))
    } catch (error) {
      console.error('Failed to load table:', error)
      setState((prev) => ({ ...prev, loading: false }))
    }
  }, [parentItemId, setLoading])

  const addSubitem = useCallback(
    async (newSubitemName: string) => {
      if (!newSubitemName) {
        addToast({
          message: 'Name cannot be empty',
          type: 'negative',
          timeToLive: 1000,
        })
        return
      }

      if (/[<>"]/.test(newSubitemName)) {
        addToast({
          message: 'Name cannot include special characters < > and "',
          type: 'negative',
          timeToLive: 1000,
        })
        return
      }

      if (state.subitems.length >= 500) {
        addToast({
          message: 'This item has reached the limit of 500 subitems',
          type: 'negative',
          timeToLive: 1000,
        })
        return
      }

      const purifiedInput = DOMPurify.sanitize(newSubitemName)
      const toastId = addToast({
        message: 'Adding subitem...',
        type: 'positive',
        loading: true,
      })

      try {
        const data = await subitemApi.createSubitem(parentItemId, purifiedInput)

        if (data.errors) {
          throw new Error(data.errors[0].message)
        }

        await loadTable()
        removeToast(toastId)
        addToast({
          message: 'Subitem added successfully',
          type: 'positive',
          timeToLive: 1000,
        })
        await monday.execute('valueCreatedForUser')
      } catch (error) {
        removeToast(toastId)
        addToast({
          message: 'Error adding subitem. Please try again or contact support.',
          type: 'negative',
          timeToLive: 2000,
        })
        console.error('Error adding subitem:', error)
      }
    },
    [addToast, loadTable, parentItemId, removeToast, state.subitems.length],
  )

  const deleteSubitem = useCallback(
    async (subItemId: string) => {
      const toastId = addToast({
        message: 'Deleting subitem...',
        type: 'positive',
        loading: true,
      })

      try {
        const data = await subitemApi.deleteSubitem(subItemId)

        if (data.errors) {
          throw new Error(data.errors[0].message)
        }

        await loadTable()
        removeToast(toastId)
        addToast({
          message: 'Subitem deleted successfully',
          type: 'positive',
          timeToLive: 1000,
        })
        await monday.execute('valueCreatedForUser')
      } catch (error) {
        removeToast(toastId)
        addToast({
          message:
            'Error deleting subitem. Please try again or contact support.',
          type: 'negative',
          timeToLive: 2000,
        })
        console.error('Error deleting subitem:', error)
      }
    },
    [addToast, loadTable, removeToast],
  )

  // Update subitemIds ref whenever subitems change
  useEffect(() => {
    subitemIdsRef.current = new Set(state.subitems.map((item) => item.id))
  }, [state.subitems])

  // Set up event listeners
  useEffect(() => {
    const unsubscribeEvents = monday.listen(
      'events',
      (res: { data: Record<string, any> & MondayEvent }) => {
        if (
          shouldRefreshOnEvent(
            res.data,
            parentItemId,
            boardId,
            subitemIdsRef.current,
          )
        ) {
          loadTable()
        }
      },
    )

    const unsubscribeItemChanges = monday.listen(
      ['itemIds'],
      (res: { data: { itemIds: number[] } }) => {
        if (
          shouldRefreshOnItemChange(
            res.data.itemIds || [],
            parentItemId,
            subitemIdsRef.current,
          )
        ) {
          loadTable()
        }
      },
    )

    return () => {
      unsubscribeEvents()
      unsubscribeItemChanges()
    }
  }, [boardId, loadTable, parentItemId])

  // Initial load
  useEffect(() => {
    loadTable()
  }, [loadTable])

  return {
    subitems: state.subitems,
    columns: state.columns,
    loading: state.loading,
    addSubitem,
    deleteSubitem,
  }
}

export default useSubitems
