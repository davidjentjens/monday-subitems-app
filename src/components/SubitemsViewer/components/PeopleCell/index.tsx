import {
  Avatar,
  Button,
  Dialog,
  DialogContentContainer,
  List,
  Search,
  Text,
} from 'monday-ui-react-core'
import { useState } from 'react'
import { useUserDataContext } from 'src/hooks/useUserData'
import { Subitem } from 'src/interfaces'
import { monday } from 'src/services'

interface PeopleCellProps {
  boardId: number | null
  subitem: Subitem
  columnId: string
}

export const PeopleCell: React.FC<PeopleCellProps> = ({
  boardId,
  subitem,
  columnId,
}) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const [personId, setPersonId] = useState<number | null>(
    subitem[columnId]?.value
      ? subitem[columnId]?.value.personsAndTeams[0]?.id
      : null,
  )

  const [searchUsers, setSearchUsers] = useState('')

  const { retrieveUserData, allUserData } = useUserDataContext()

  let userData
  if (personId) {
    userData = retrieveUserData(personId)
  }

  const filteredUsers = allUserData.filter((user) =>
    user.name.toLowerCase().includes(searchUsers.toLowerCase()),
  )

  const changeUser = async (userId: number) => {
    setPersonId(userId)
    setDialogIsOpen(false)

    await monday.api(`
      mutation {
        change_column_value(board_id: ${boardId}, item_id: ${subitem.id}, column_id: "${columnId}", value: "{\\"personsAndTeams\\":[{\\"id\\":${userId},\\"kind\\":\\"person\\"}]}") {
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
            <Search
              placeholder="Search names, roles or teams"
              onChange={(value) => setSearchUsers(value)}
            />
            <List style={{ gap: 8 }}>
              <>
                <Text style={{ marginTop: 16, marginBottom: 8 }}>
                  Suggested people
                </Text>
                {filteredUsers.map((user) => (
                  <Button
                    key={user.id}
                    kind={'tertiary' as any}
                    onClick={() => changeUser(user.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <Avatar
                      size={Avatar.sizes.SMALL}
                      type={Avatar.types.IMG}
                      src={user.photoSmall}
                      backgroundColor={Avatar.colors.LIPSTICK}
                      ariaLabel={user.name}
                    />
                    <span>{user.name}</span>
                  </Button>
                ))}
              </>
            </List>
          </>
        </DialogContentContainer>
      }
      position={'bottom' as any}
      tooltip
    >
      <Avatar
        size={Avatar.sizes.MEDIUM}
        type={userData?.photoSmall ? Avatar.types.IMG : Avatar.types.TEXT}
        src={userData?.photoSmall}
        backgroundColor={Avatar.colors.LIPSTICK}
        tooltipProps={{
          content: userData?.name,
          position: 'top' as any,
        }}
        onClick={() => setDialogIsOpen(true)}
      />
    </Dialog>
  )
}
