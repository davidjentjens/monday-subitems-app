import DOMPurify from 'dompurify'
import { useCallback, useEffect, useState } from 'react'
import { MondayEvent, Subitem, SubitemColumn } from 'src/interfaces'
import { monday } from 'src/services'

import { useToast } from '../useToast'
import { subitemApi } from './api'
import {
  shouldRefreshOnEvent,
  shouldRefreshOnItemChange,
} from './eventHandlers'

interface UseSubitemsProps {
  boardId: number
  parentItemId: number
}

const useSubitems = ({ boardId, parentItemId }: UseSubitemsProps) => {
  const { addToast, removeToast } = useToast()

  const [state, setState] = useState({
    subitems: [] as Subitem[],
    columns: [] as SubitemColumn[],
    loading: false,
    newSubitemName: '',
  })

  const onNewSubitemNameChange = (value: string) => {
    setState((prev) => ({ ...prev, newSubitemName: value }))
  }

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }))
  }

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
      }))
    } catch (error) {
      console.error('Failed to load table:', error)
    } finally {
      setLoading(false)
    }
  }, [parentItemId])

  const addSubitem = useCallback(async () => {
    if (!state.newSubitemName) {
      addToast({
        message: 'Name cannot be empty',
        type: 'negative',
        timeToLive: 1000,
      })
      return
    }

    if (/[<>"]/.test(state.newSubitemName)) {
      return addToast({
        message: 'Name cannot include special characters < > and "',
        type: 'negative',
        timeToLive: 1000,
      })
    }

    const purifiedInput = DOMPurify.sanitize(state.newSubitemName)

    const toastId = addToast({
      message: 'Adding subitem...',
      type: 'positive',
      loading: true,
    })

    try {
      setState((prev) => ({ ...prev, newSubitemName: '' }))
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
      addToast({
        message: 'Error adding subitem. Please try again or contact support.',
        type: 'negative',
        timeToLive: 2000,
      })
      console.error('Error adding subitem:', error)
    }
  }, [addToast, loadTable, state.newSubitemName, parentItemId, removeToast])

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

  useEffect(() => {
    const unsubscribeEvents = monday.listen(
      'events',
      (res: { data: Record<string, any> & MondayEvent }) => {
        console.log('event', res)

        if (
          shouldRefreshOnEvent(res.data, parentItemId, boardId, state.subitems)
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
            state.subitems,
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
  }, [boardId, loadTable, parentItemId, state.subitems])

  useEffect(() => {
    loadTable()
  }, [loadTable, parentItemId])

  return {
    ...state,
    fetchSubitems: loadTable,
    addSubitem,
    deleteSubitem,
    onNewSubitemNameChange,
  }
}

export default useSubitems
