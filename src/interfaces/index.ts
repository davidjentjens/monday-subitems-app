export interface SubitemColumn {
  id: string
  title: string
  type: string
  value: string
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
  id: number
  name: string
  createdAt: string
  email: string
  photoSmall: string
  account: {
    name: string
    id: string
  }
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
