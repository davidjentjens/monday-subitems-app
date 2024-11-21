export const SUPPORTED_COLUMN_TYPES = [
  'name',
  'text',
  'status',
  'people',
  'delete',
  'numbers',
] as const

export const REFRESH_EVENT_TYPES = [
  'subitem_created',
  'subitem_deleted',
  'subitem_updated',
  'subitem_name_updated',
  'column_value_changed',
] as const
