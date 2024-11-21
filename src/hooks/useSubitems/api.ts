import { Subitem, SubitemColumn } from 'src/interfaces'
import { monday } from 'src/services'

import { SUPPORTED_COLUMN_TYPES } from './constants'

export const subitemApi = {
  async fetchColumns(parentItemId: number): Promise<SubitemColumn[]> {
    const query = `
      query {
        items(ids: ${parentItemId}) {
          subitems {
            name
            column_values {
              id
              type
              column {
                title
                settings_str
              }
            }
          }
        }
      }
    `
    const response = await monday.api(query)
    if (!response.data.items[0]?.subitems[0]) {
      return []
    }

    const columns: SubitemColumn[] =
      response.data.items[0].subitems[0].column_values
        .filter((columnValue: any) =>
          SUPPORTED_COLUMN_TYPES.includes(columnValue.type),
        )
        .map(
          (columnValue: any): SubitemColumn => ({
            id: columnValue.id,
            title: columnValue.column.title,
            type: columnValue.type,
            settings: JSON.parse(columnValue.column.settings_str),
          }),
        )

    columns.unshift({
      id: 'name',
      title: 'Name',
      type: 'name',
      value: response.data.items[0].subitems[0].name,
    })
    columns.push({
      id: 'delete',
      title: '',
      type: 'delete',
      width: '100px',
    })

    return columns
  },

  async fetchSubitems(
    parentItemId: number,
  ): Promise<{ items: Subitem[]; boardId: number | null }> {
    const query = `
      query {
        items(ids: ${parentItemId}) {
          subitems {
            board {
              id
            }
            id
            name
            column_values {
              id
              type
              value
            }
          }
        }
      }
    `
    const response = await monday.api(query)

    if (!response.data.items[0] || !response.data.items[0].subitems.length) {
      return { items: [], boardId: null }
    }

    const boardId = response.data.items[0].subitems[0].board.id
    const items: Subitem[] = response.data.items[0].subitems.map(
      (subitem: any): Subitem => ({
        id: subitem.id,
        name: subitem.name,
        ...subitem.column_values
          .filter((column: any) => SUPPORTED_COLUMN_TYPES.includes(column.type))
          .reduce((acc: any, column: any) => {
            acc[column.id] = {
              ...column,
              value: JSON.parse(column.value),
            }
            return acc
          }, {}),
      }),
    )

    return { items, boardId }
  },

  async createSubitem(parentItemId: number, name: string) {
    const { data } = await monday.api(`
      mutation {
        create_subitem (parent_item_id: ${parentItemId}, item_name: "${name}") {
          id
        }
      }
    `)
    return data
  },

  async deleteSubitem(subItemId: string) {
    const { data } = await monday.api(`
      mutation {
        delete_item (item_id: ${subItemId}) {
          id
        }
      }
    `)
    return data
  },
}
