import './styles.css'

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
} from 'monday-ui-react-core'
import React, { useCallback, useMemo } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { SubitemsProvider } from 'src/hooks'
import useSubitems from 'src/hooks/useSubitems'
import { Subitem, SubitemColumn, UserData } from 'src/interfaces'

import { DeleteCell } from './components/CustomCells/DeleteCell'
import { NumbersCell } from './components/CustomCells/NumbersCell'
import { PeopleCell } from './components/CustomCells/PeopleCell'
import { StatusCell } from './components/CustomCells/StatusCell'
import { TextCell } from './components/CustomCells/TextCell'
import { SubitemInput } from './components/SubitemInput'
import { TableEmptyState } from './components/TableEmptyState'
import { CustomTableBody } from './components/Virtualized'

interface SubitemsViewerProps {
  boardId: number
  parentItemId: number
}

const SubitemsViewer: React.FC<SubitemsViewerProps> = ({
  boardId,
  parentItemId,
}) => {
  const { subitems, columns, loading, addSubitem, deleteSubitem } = useSubitems(
    { parentItemId, boardId },
  )

  const statusColumnIds = useMemo(
    () =>
      columns
        .filter((column) => column.type === 'status')
        .map((column) => column.id),
    [columns],
  )

  const renderTableCell = useCallback(
    (column: SubitemColumn, subitem: Subitem) => {
      switch (column.type) {
        case 'name':
          return (
            <TextCell
              boardId={boardId}
              subItemId={subitem.id}
              selectedValue={subitem.name}
              columnId={column.id}
            />
          )
        case 'text':
          return (
            <TextCell
              boardId={boardId}
              subItemId={subitem.id}
              selectedValue={subitem[column.id]?.value ?? ''}
              columnId={column.id}
            />
          )
        case 'numbers':
          return (
            <NumbersCell
              boardId={boardId}
              subItemId={subitem.id}
              selectedValue={subitem[column.id]?.value ?? ''}
              columnId={column.id}
              columns={columns}
            />
          )
        case 'status':
          return (
            <StatusCell
              boardId={boardId}
              subItemId={subitem.id}
              selectedValue={subitem[column.id].value?.index}
              columnId={column.id}
            />
          )
        case 'people':
          return (
            <PeopleCell
              boardId={boardId}
              subItemId={subitem.id}
              selectedValue={
                subitem[column.id]?.value
                  ? subitem[column.id]?.value.personsAndTeams.map(
                      (user: UserData) => user.id.toString(),
                    )
                  : []
              }
              columnId={column.id}
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

  const handleAddSubitem = useCallback(
    (name: string) => {
      addSubitem(name)
    },
    [addSubitem],
  )

  return (
    <SubitemsProvider boardId={boardId!} columnIds={statusColumnIds}>
      <div style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>
        {loading ? (
          <TableEmptyState loading={loading} />
        ) : (
          <Table
            dataState={{
              isLoading: loading,
              isError: false,
            }}
            columns={columns}
            emptyState={<TableEmptyState loading={loading} />}
            errorState={
              <div style={{ padding: 16 }}>Failed to load subitems</div>
            }
            style={{
              scrollbarWidth: 'none',
            }}
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
        )}
      </div>
      <SubitemInput onAdd={handleAddSubitem} />
    </SubitemsProvider>
  )
}
SubitemsViewer.displayName = 'SubitemsViewer'

export default React.memo(SubitemsViewer)
