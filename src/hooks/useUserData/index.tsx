import { Loader } from 'monday-ui-react-core'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserData } from 'src/interfaces'
import { monday } from 'src/services'

const fetchAllUserDataForBoard = async (
  boardId: number,
): Promise<UserData[]> => {
  const query = `
    query {
      boards(ids: ${boardId}) {
        board_kind
        subscribers {
          id
          name
          created_at
          email
          photo_small
          account {
            name
            id
          }
        }
      }
    }
  `
  const response = await monday.api(query)

  const board = response.data.boards[0]

  return board.subscribers.map(
    (user: any): UserData => ({
      id: user.id,
      name: user.name,
      createdAt: user.created_at,
      email: user.email,
      photoSmall: user.photo_small,
      account: {
        name: user.account.name,
        id: user.account.id,
      },
    }),
  )
}

interface UserDataContextProps {
  boardId: number | null
  boardUserData: UserData[]
  loading: boolean
}

const UserDataContext = createContext<UserDataContextProps | undefined>(
  undefined,
)

export const useUserDataContext = (): UserDataContextProps => {
  const context = useContext(UserDataContext)
  if (!context) {
    throw new Error('useUserDataContext must be used within a UserDataProvider')
  }
  return context
}

/**
 * Provides user data to the application.
 * @param children - The child components to render.
 */
export const UserDataProvider: React.FC<{
  children: React.ReactNode
  boardId: number | null
}> = ({ children, boardId }) => {
  const [boardUserData, setBoardUserData] = useState<UserData[]>([])

  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!boardId) {
        setLoading(false)
        return
      }

      const boardData = await fetchAllUserDataForBoard(boardId)
      setBoardUserData(boardData)
      setLoading(false)
    }
    fetchData()
  }, [boardId])

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 8,
          height: '30vh',
        }}
      >
        <Loader size={Loader.sizes.MEDIUM} color={Loader.colors.SECONDARY} />
      </div>
    )
  }

  return (
    <UserDataContext.Provider value={{ boardId: null, boardUserData, loading }}>
      {children}
    </UserDataContext.Provider>
  )
}
