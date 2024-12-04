import './styles.css'

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
} from 'monday-ui-react-core'
import React, { useCallback } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { SubitemsProvider } from 'src/hooks'
import useSubitems from 'src/hooks/useSubitems'
import { Subitem, SubitemColumn, UserData } from 'src/interfaces'

import {
  DeleteCell,
  NumbersCell,
  PeopleCell,
  StatusCell,
  TextCell,
} from './components/CustomCells'
import { SubitemInput } from './components/SubitemInput'
import { TableEmptyState } from './components/TableEmptyState'
import { UpdateNotice } from './components/UpdateNotice'
import { CustomTableBody } from './components/Virtualized'

const SubitemsViewer: React.FC<{ parentItemId: number }> = ({
  parentItemId,
}) => {
  const { subitems, columns, loading, addSubitem, deleteSubitem, boardId } =
    useSubitems({ parentItemId })

  const statusColumnIds = React.useMemo(
    () =>
      columns
        .filter((column) => column.type === 'status')
        .map((column) => column.id),
    [columns],
  )

  const renderTableCell = React.useCallback(
    (column: SubitemColumn, subitem: Subitem) => {
      switch (column.type) {
        case 'name':
          return (
            <TextCell
              isNameColumn={true}
              boardId={boardId}
              subItemId={subitem.id}
              columnId={column.id}
              selectedValue={subitem.name}
            />
          )
        case 'text':
          return (
            <TextCell
              boardId={boardId}
              subItemId={subitem.id}
              columnId={column.id}
              selectedValue={subitem[column.id]?.value ?? ''}
            />
          )
        case 'numbers':
          return (
            <NumbersCell
              boardId={boardId}
              subItemId={subitem.id}
              columnId={column.id}
              selectedValue={subitem[column.id]?.value ?? ''}
              columns={columns}
            />
          )
        case 'status':
          return (
            <StatusCell
              boardId={boardId}
              subItemId={subitem.id}
              columnId={column.id}
              selectedValue={subitem[column.id].value?.index}
            />
          )
        case 'people':
          return (
            <PeopleCell
              boardId={boardId}
              subItemId={subitem.id}
              columnId={column.id}
              selectedValue={
                subitem[column.id]?.value?.personsAndTeams?.map(
                  (user: UserData) => user.id.toString(),
                ) ?? []
              }
            />
          )
        case 'delete':
          return (
            <DeleteCell
              boardId={boardId}
              subItemId={subitem.id}
              deleteSubitem={deleteSubitem}
            />
          )
        default:
          return 'Unsupported column type'
      }
    },
    [boardId, columns, deleteSubitem],
  )

  const getTable = useCallback(() => {
    if (loading) {
      return (
        <div style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>
          <TableEmptyState state="loading" />
        </div>
      )
    }

    if (!boardId) {
      return <TableEmptyState state="empty" itemId={parentItemId} />
    }

    return (
      <Table
        dataState={{ isLoading: loading, isError: false }}
        columns={columns}
        emptyState={<TableEmptyState state="empty" />}
        errorState={<div style={{ padding: 16 }}>Failed to load subitems</div>}
        style={{ scrollbarWidth: 'none' }}
      >
        <TableHeader className="monday-style-table-header">
          {columns.map((column) => (
            <TableHeaderCell key={column.id} title={column.title} />
          ))}
        </TableHeader>
        <TableBody className="monday-style-table-body">
          <AutoSizer>
            {({ height, width }) => (
              <CustomTableBody
                height={height}
                width={width}
                subitems={subitems}
                columns={columns}
                boardId={boardId}
                renderTableCell={renderTableCell}
              />
            )}
          </AutoSizer>
        </TableBody>
      </Table>
    )
  }, [boardId, columns, loading, parentItemId, renderTableCell, subitems])

  return (
    <SubitemsProvider boardId={boardId} columnIds={statusColumnIds}>
      <div style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>
        {getTable()}
      </div>
      <SubitemInput onAdd={addSubitem} />
      {subitems.length > 0 && <UpdateNotice />}
    </SubitemsProvider>
  )
}

export default React.memo(SubitemsViewer)
