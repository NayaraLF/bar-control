import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from '../theme'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
})

export function useThemeMode() {
  return useContext(ThemeContext)
}

function getSavedMode(): ThemeMode {
  try {
    const saved = localStorage.getItem('barcontrol-theme')
    if (saved === 'dark' || saved === 'light') return saved
  } catch { /* localStorage indisponível */ }
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getSavedMode)

  useEffect(() => {
    try {
      localStorage.setItem('barcontrol-theme', mode)
    } catch { /* ignora */ }
  }, [mode])

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
