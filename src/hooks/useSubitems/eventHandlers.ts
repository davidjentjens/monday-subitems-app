import { MondayEvent, Subitem } from 'src/interfaces'

import { REFRESH_EVENT_TYPES } from './constants'

export const shouldRefreshOnEvent = (
  event: MondayEvent,
  parentItemId: number,
  boardId: number | null,
  subitems: Subitem[],
): boolean => {
  return (
    REFRESH_EVENT_TYPES.includes(
      event.type as (typeof REFRESH_EVENT_TYPES)[number],
    ) &&
    (event.parentItemId === parentItemId ||
      event.boardId === boardId ||
      (event.itemIds || []).some((id) =>
        subitems.some((subitem) => subitem.id === id.toString()),
      ))
  )
}

export const shouldRefreshOnItemChange = (
  changedItemIds: number[],
  parentItemId: number,
  subitems: Subitem[],
): boolean => {
  return (
    changedItemIds.includes(parentItemId) ||
    changedItemIds.some((id) =>
      subitems.some((subitem) => subitem.id === id.toString()),
    )
  )
}
