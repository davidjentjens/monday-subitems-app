import './styles.css'

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TextField,
} from 'monday-ui-react-core'
import React, { useMemo, useState } from 'react'
import { Subitem, SubitemColumn, UserData } from 'src/interfaces'

import { DeleteCell } from './components/DeleteCell'
import { PeopleCell } from './components/PeopleCell'
import { StatusCell } from './components/StatusCell'
import { TableEmptyState } from './components/TableEmptyState'
import { TextCell } from './components/TextCell'
import { AppProvider } from './hooks'
import useSubitems from './hooks/useSubitems'

interface SubitemsViewerProps {
  parentItemId: number
}

const SubitemsViewer: React.FC<SubitemsViewerProps> = ({ parentItemId }) => {
  const {
    boardId,
    subitems,
    columns,
    loading,
    addSubitem,
    deleteSubitem,
    newSubitemName,
    onNewSubitemNameChange,
  } = useSubitems(parentItemId)

  const [textInputBlurred, setTextInputBlurred] = useState(false)

  const statusColumnIds = useMemo(
    () =>
      columns
        .filter((column) => column.type === 'status')
        .map((column) => column.id),
    [columns],
  )

  const subItemNameValidation = useMemo(() => {
    const isValid = newSubitemName.length > 0

    if (!textInputBlurred || isValid) {
      return {
        status: 'success' as any,
        text: '',
      }
    }

    return {
      status: 'error',
      text: 'Name cannot be empty',
    }
  }, [newSubitemName.length, textInputBlurred])

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
  }

  return (
    <AppProvider boardId={boardId!} columnIds={statusColumnIds}>
      <Table
        dataState={{
          isLoading: loading,
          isError: false,
        }}
        columns={columns}
        emptyState={<TableEmptyState />}
        errorState={<div style={{ padding: 16 }}>Failed to load subitems</div>}
        style={{ minWidth: '800px !important', overflowX: 'auto' }}
      >
        {columns.length === 0 ? (
          <></>
        ) : (
          <TableHeader className="table-header">
            {columns.map((column) => (
              <TableHeaderCell key={column.id} title={column.title} />
            ))}
          </TableHeader>
        )}

        <TableBody>
          {subitems.map((subitem) => (
            <TableRow key={subitem.id}>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {renderTableCell(column, subitem)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 8,
          width: '100%',
        }}
      >
        <TextField
          value={newSubitemName}
          onChange={(value) => onNewSubitemNameChange(value)}
          placeholder="New subitem name"
          onKeyDown={(e) => e.key === 'Enter' && addSubitem()}
          size={TextField.sizes.LARGE}
          onFocus={() => setTextInputBlurred(false)}
          onBlur={() => setTextInputBlurred(true)}
          validation={subItemNameValidation}
        />
        <Button
          onClick={addSubitem}
          loading={loading}
          size={Button.sizes.LARGE}
          kind={Button.kinds.PRIMARY}
        >
          + Add Subitem
        </Button>
      </div>
    </AppProvider>
  )
}

export default SubitemsViewer
