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
