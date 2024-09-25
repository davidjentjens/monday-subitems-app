import {
  Avatar,
  AvatarGroup,
  Chips,
  Dialog,
  DialogContentContainer,
  List,
  ListItem,
  Search,
  Text,
} from 'monday-ui-react-core'
import { useMemo, useState } from 'react'
import maleIcon from 'src/assets/maleIcon.png'
import { CellProps, UserData } from 'src/interfaces'
import { monday } from 'src/services'

import { useUserDataContext } from '../../hooks/useUserData'

export const PeopleCell: React.FC<CellProps> = ({
  boardId,
  subItemId,
  selectedValue,
  columnId,
}) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const [selectedUserIds, setSelectedUserIds] =
    useState<string[]>(selectedValue)

  const [searchUsers, setSearchUsers] = useState('')

  const { boardUserData } = useUserDataContext()

  const selectedUsers = useMemo(() => {
    console.log(typeof selectedUserIds[0])
    return (
      selectedUserIds
        .map((userId) =>
          boardUserData.find((user) => {
            console.log(typeof user.id, typeof userId)
            return user.id === userId
          }),
        )
        // Filter out undefined values
        .filter((user) => user !== undefined) as UserData[]
    )
  }, [boardUserData, selectedUserIds])

  const filteredUnselectedUsers = useMemo(
    () =>
      boardUserData
        .filter((user) =>
          user.name.toLowerCase().includes(searchUsers.toLowerCase()),
        )
        .filter((user) => !selectedUserIds.includes(user.id)),
    [boardUserData, searchUsers, selectedUserIds],
  )

  const changeUser = async (userId: string) => {
    let updatedUserIds
    if (selectedUserIds.includes(userId)) {
      updatedUserIds = selectedUserIds.filter((id) => id !== userId)
    } else {
      updatedUserIds = [...selectedUserIds, userId]
    }
    console.log(typeof updatedUserIds[0])
    setSelectedUserIds(updatedUserIds)

    await monday.api(`
      mutation {
        change_column_value(board_id: ${boardId}, item_id: ${subItemId}, column_id: "${columnId}", value: "{\\"personsAndTeams\\":[${updatedUserIds.map((id) => `{\\"id\\":${id},\\"kind\\":\\"person\\"}`).join(',')}]}") {
          id
        }
      }
    `)
  }

  const removeUser = async (userId: string) => {
    const updatedUserIds = selectedUserIds.filter((id) => id !== userId)
    setSelectedUserIds(updatedUserIds)

    await monday.api(`
      mutation {
        change_column_value(board_id: ${boardId}, item_id: ${subItemId}, column_id: "${columnId}", value: "{\\"personsAndTeams\\":[${updatedUserIds.map((id) => `{\\"id\\":${id},\\"kind\\":\\"person\\"}`).join(',')}]}") {
          id
        }
      }
    `)
  }

  return (
    <Dialog
      showTrigger={[]}
      open={dialogIsOpen}
      onClickOutside={() => setDialogIsOpen(false)}
      content={
        <DialogContentContainer
          style={{
            width: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <>
            <Text style={{ marginBottom: 8 }}>Selected people</Text>
            <List>
              {selectedUsers.map((user) => (
                <div key={user.id} style={{ marginBottom: 8 }}>
                  <Chips
                    onDelete={() => removeUser(user.id)}
                    label={user.name}
                  />
                </div>
              ))}
            </List>
            <Search
              placeholder="Search for user names"
              onChange={(value) => setSearchUsers(value)}
            />
            <Text style={{ marginTop: 16, marginBottom: 8 }}>
              Select people from the list below
            </Text>
            <List>
              {filteredUnselectedUsers.length === 0 ? (
                <ListItem>
                  <Text>No users found</Text>
                </ListItem>
              ) : (
                filteredUnselectedUsers.map((user) => (
                  <ListItem
                    key={user.id}
                    onClick={() => changeUser(user.id)}
                    size="small"
                  >
                    <div
                      style={{ gap: 8, display: 'flex', alignItems: 'center' }}
                    >
                      <Avatar
                        size={Avatar.sizes.SMALL}
                        type={Avatar.types.IMG}
                        src={user.photoSmall}
                        backgroundColor={Avatar.colors.LIPSTICK}
                        ariaLabel={user.name}
                      />
                      <span>{user.name}</span>
                    </div>
                  </ListItem>
                ))
              )}
            </List>
          </>
        </DialogContentContainer>
      }
      position={'bottom' as any}
      tooltip
    >
      <AvatarGroup size={Avatar.sizes.MEDIUM} max={2}>
        {selectedUsers.length === 0 ? (
          <Avatar
            type={Avatar.types.IMG}
            src={maleIcon}
            tooltipProps={{
              content: 'Add people',
              position: 'top' as any,
            }}
            onClick={() => setDialogIsOpen(true)}
          />
        ) : (
          selectedUsers.map((user) => (
            <Avatar
              key={user.id}
              type={user.photoSmall ? Avatar.types.IMG : Avatar.types.TEXT}
              src={user.photoSmall}
              backgroundColor={Avatar.colors.LIPSTICK}
              tooltipProps={{
                content: user.name,
                position: 'top' as any,
              }}
              onClick={() => setDialogIsOpen(true)}
            />
          ))
        )}
      </AvatarGroup>
    </Dialog>
  )
}
