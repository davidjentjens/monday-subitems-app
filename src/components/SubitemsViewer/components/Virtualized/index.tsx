import { TableCell, TableRow } from 'monday-ui-react-core'
import React, { useMemo } from 'react'
import { VariableSizeList as List } from 'react-window'
import { Subitem, SubitemColumn } from 'src/interfaces'

interface VirtualRowProps {
  index: number
  style: React.CSSProperties
  data: {
    subitems: Subitem[]
    columns: SubitemColumn[]
    boardId: number
    renderTableCell: (
      _column: SubitemColumn,
      _subitem: Subitem,
    ) => React.ReactNode
  }
}

export const VirtualRow = React.memo(
  ({ index, style, data }: VirtualRowProps) => {
    const { subitems, columns, renderTableCell } = data
    const subitem = subitems[index]

    return (
      <TableRow style={style}>
        {columns.map((column) => (
          <TableCell key={column.id} className="monday-style-table-cell">
            {renderTableCell(column, subitem)}
          </TableCell>
        ))}
      </TableRow>
    )
  },
)
VirtualRow.displayName = 'VirtualRow'

interface CustomTableBodyProps {
  height: number
  width: number
  subitems: Subitem[]
  columns: SubitemColumn[]
  boardId: number
  renderTableCell: (
    _column: SubitemColumn,
    _subitem: Subitem,
  ) => React.ReactNode
}

export const CustomTableBody = React.memo(
  ({
    height,
    width,
    subitems,
    columns,
    boardId,
    renderTableCell,
  }: CustomTableBodyProps) => {
    const listData = useMemo(
      () => ({
        subitems,
        columns,
        boardId,
        renderTableCell,
      }),
      [subitems, columns, boardId, renderTableCell],
    )

    return (
      <List
        height={height}
        itemCount={subitems.length}
        itemSize={() => 44} // Monday UI default row height
        width={width}
        itemData={listData}
        className="monday-style-table-body"
      >
        {VirtualRow}
      </List>
    )
  },
)
CustomTableBody.displayName = 'CustomTableBody'
