import { createTheme } from '@mui/material/styles'

const shared = {
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none' as const,
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          fontSize: '1rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: 48,
          },
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 60,
        },
      },
    },
  },
}

export const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: 'light',
    primary: { main: '#1565C0' },
    secondary: { main: '#FF8F00' },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
})

export const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: 'dark',
    primary: { main: '#90CAF9' },
    secondary: { main: '#FFB74D' },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
})
