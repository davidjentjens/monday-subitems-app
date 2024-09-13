import React, { createContext, useContext, useEffect, useState } from 'react'

import { UserData } from '../interfaces'
import { monday } from '../services'

interface UserDataContextProps {
  boardId: number | null
  allUserData: UserData[]
  // eslint-disable-next-line no-unused-vars
  retrieveUserData: (userId: number) => UserData | undefined
  loading: boolean
}

const UserDataContext = createContext<UserDataContextProps | undefined>(
  undefined,
)

const fetchAllUserData = async (boardId: number): Promise<UserData[]> => {
  const query = `
    query {
      boards(ids: ${boardId}) {
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
  return response.data.boards[0].subscribers.map(
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

/**
 * Provides user data to the application.
 * @param children - The child components to render.
 */
export const UserDataProvider: React.FC<{
  children: React.ReactNode
  boardId: number
}> = ({ children, boardId }) => {
  const [allUserData, setAllUserData] = useState<UserData[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const retrieveUserData = (userId: number): UserData | undefined =>
    allUserData.find((user) => user.id == userId)

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAllUserData(boardId)
      setAllUserData(data)
      setLoading(false)
    }
    fetchData()
  }, [boardId])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <UserDataContext.Provider
      value={{ boardId: null, allUserData, retrieveUserData, loading }}
    >
      {children}
    </UserDataContext.Provider>
  )
}

export const useUserDataContext = (): UserDataContextProps => {
  const context = useContext(UserDataContext)
  if (!context) {
    throw new Error('useUserDataContext must be used within a UserDataProvider')
  }
  return context
}
