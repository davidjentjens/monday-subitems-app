import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHeaderCell,
  TableRow,
  TextField,
} from 'monday-ui-react-core'
import React, { useMemo } from 'react'
import { Subitem, SubitemColumn, UserData } from 'src/interfaces'

import { PeopleCell } from './components/PeopleCell'
import { StatusCell } from './components/StatusCell'
import { TextCell } from './components/TextCell'
import { AppProvider } from './hooks'
import useSubitemColumns from './hooks/useSubitemColumns'
import useSubitems from './hooks/useSubitems'

interface SubitemsViewerProps {
  parentItemId: number
}

export const SUPPORTED_COLUMN_TYPES = ['name', 'text', 'status', 'people']

const SubitemsViewer: React.FC<SubitemsViewerProps> = ({ parentItemId }) => {
  const { subitemColumns, loading: columnsLoading } =
    useSubitemColumns(parentItemId)
  const {
    boardId,
    subitems,
    loading: itemsLoading,
    addSubitem,
    newSubitemName,
    onNewSubitemNameChange,
  } = useSubitems(parentItemId)

  const statusColumnIds = useMemo(
    () =>
      subitemColumns
        .filter((column) => column.type === 'status')
        .map((column) => column.id),
    [subitemColumns],
  )

  const renderTableCell = (column: SubitemColumn, subitem: Subitem) => {
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
                    (user: UserData) => user.id,
                  )
                : []
            }
            columnId={column.id}
          />
        )
      default:
        return 'Unsupported column type'
    }
  }

  return (
    <div>
      <Table
        dataState={{
          isLoading: boardId === null || columnsLoading,
        }}
        columns={subitemColumns.map((column) => ({
          id: column.id,
          title: column.title,
        }))}
        emptyState={<></>}
        errorState={<></>}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${subitemColumns.length}, 1fr)`,
          }}
        >
          {subitemColumns.map((column) => (
            <TableHeaderCell key={column.id} title={column.title} />
          ))}
        </div>

        <AppProvider boardId={boardId!} columnIds={statusColumnIds}>
          <TableBody>
            {columnsLoading ? (
              <></>
            ) : (
              subitems.map((subitem) => (
                <TableRow key={subitem.id}>
                  {subitemColumns.map((column) => (
                    <TableCell key={column.id}>
                      {renderTableCell(column, subitem)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </AppProvider>
      </Table>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          marginTop: 16,
          width: '80vw',
        }}
      >
        <TextField
          value={newSubitemName}
          onChange={(value) => onNewSubitemNameChange(value)}
          placeholder="New subitem name"
          onKeyDown={(e) => e.key === 'Enter' && addSubitem()}
        />
        <Button
          onClick={addSubitem}
          loading={itemsLoading}
          size={Button.sizes.SMALL}
          kind={Button.kinds.SECONDARY}
        >
          Add Subitem
        </Button>
      </div>
    </div>
  )
}

export default SubitemsViewer
