import React from 'react'

type Theme = 'dark' | 'light' | 'black'

interface CustomThemeContextProps {
  theme: Theme
  changeTheme: (_newTheme: Theme) => void
}

interface CustomThemeProviderProps {
  defaultTheme: Theme
  children: React.ReactNode
}

const CustomThemeContext = React.createContext<
  CustomThemeContextProps | undefined
>(undefined)

export const useCustomTheme = (): CustomThemeContextProps => {
  const context = React.useContext(CustomThemeContext)
  if (!context) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider')
  }
  return context
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
  defaultTheme,
  children,
}) => {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return (
    <CustomThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </CustomThemeContext.Provider>
  )
}
