import {
  Table,
  TableBody,
  TableCell,
  TableHeaderCell,
  TableRow,
} from 'monday-ui-react-core'
import React, { useState } from 'react'
import { UserDataProvider } from 'src/hooks/useUserData'
import { Subitem, SubitemColumn } from 'src/interfaces'
import { monday } from 'src/services'

import { PeopleCell } from './components/PeopleCell'
import { StatusCell } from './components/StatusCell'
import { TextCell } from './components/TextCell'
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
    fetchSubitems,
  } = useSubitems(parentItemId)
  const [newSubitemName, setNewSubitemName] = useState('')

  const addSubitem = async () => {
    if (!newSubitemName) return
    try {
      await monday.api<{ data: { create_subitem: { id: string } } }>(
        `mutation {
            create_subitem (parent_item_id: ${parentItemId}, item_name: "${newSubitemName}") {
                id
            }
        }`,
      )
      setNewSubitemName('')
      fetchSubitems()
    } catch (error) {
      console.error('Error adding subitem:', error)
    }
  }

  const renderTableCell = (column: SubitemColumn, subitem: Subitem) => {
    switch (column.type) {
      case 'name':
        return subitem.name
      case 'text':
        return (
          <TextCell boardId={boardId} subitem={subitem} columnId={column.id} />
        )
      case 'status':
        return <StatusCell subitem={subitem} columnId={column.id} />
      case 'people':
        return (
          <PeopleCell
            boardId={boardId}
            subitem={subitem}
            columnId={column.id}
          />
        )
      default:
        return 'Unsupported column type'
    }
  }

  return (
    <div>
      <h3>Subitems for Item {parentItemId}</h3>
      {(columnsLoading || itemsLoading) && <p>Loading...</p>}
      <Table
        dataState={{
          isLoading: boardId === null || columnsLoading || itemsLoading,
        }}
        columns={subitemColumns.map((column) => ({
          id: column.id,
          title: column.title,
        }))}
        emptyState={<></>}
        errorState={<></>}
      >
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}
        >
          {subitemColumns.map((column) => (
            <TableHeaderCell key={column.id} title={column.title} />
          ))}
        </div>
        <UserDataProvider boardId={boardId!}>
          <TableBody>
            {subitems.map((subitem) => (
              <TableRow key={subitem.id}>
                {subitemColumns.map((column) => (
                  <TableCell key={column.id}>
                    {renderTableCell(column, subitem)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </UserDataProvider>
      </Table>
      <input
        type="text"
        value={newSubitemName}
        onChange={(e) => setNewSubitemName(e.target.value)}
        placeholder="New subitem name"
        onKeyDown={(e) => e.key === 'Enter' && addSubitem()}
      />
      <button onClick={addSubitem}>Add Subitem</button>
    </div>
  )
}

export default SubitemsViewer
