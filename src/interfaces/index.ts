type Width = number | `${number}%` | `${number}px` | `${number}fr`

export interface SubitemColumn {
  id: string
  title: string
  type: string
  settings?: any
  value?: string
  width?: Width
}

export interface Subitem {
  id: string
  name: string
  [key: string]: any
}

export interface SubitemsTableProps {
  subitems: Subitem[]
  subitemColumns: SubitemColumn[]
}

export interface CellProps {
  boardId: number | null
  selectedValue: any
  subItemId: string
  columnId: string
}

export interface UserData {
  id: string
  name: string
  createdAt: string
  email: string
  photoSmall: string
  account: {
    name: string
    id: string
  }
}

export interface StatusColumn {
  id: string
  settings_str: string
}

export interface StatusProps {
  name: string
  colorSettings: {
    color: string
    border: string
  }
}

export interface StatusMapState {
  columnId: string
  statusMap: { [key: number]: StatusProps }
  positions: { [key: number]: number }
  loading: boolean
}

export interface NumberSettings {
  unit: {
    symbol: '$' | '€' | '£' | '%' | 'custom' | string
    custom_unit: string
    direction: 'left' | 'right'
  }
}

export interface MondayEvent {
  type: string
  itemIds?: number[]
  parentItemId?: number
  boardId?: number
}
