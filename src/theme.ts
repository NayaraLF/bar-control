import { createTheme } from '@mui/material/styles'

// Paleta Sobrado's Bar Gestão
export const brand = {
  noite: '#050204',
  vinho: '#3D0A22',
  magenta: '#E4157E',
  neon: '#FF4FA3',
  blush: '#FFD3EA',
}

const headingFont = '"Outfit", "DM Sans", sans-serif'

const shared = {
  typography: {
    fontFamily: '"DM Sans", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: headingFont },
    h2: { fontFamily: headingFont },
    h3: { fontFamily: headingFont },
    h4: { fontFamily: headingFont },
    h5: { fontFamily: headingFont },
    h6: { fontFamily: headingFont },
    button: {
      textTransform: 'none' as const,
      fontWeight: 700,
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
    // magenta levemente escurecido para o texto branco ter contraste
    primary: { main: '#D6106F', light: brand.neon, dark: '#A00B52', contrastText: '#FFFFFF' },
    secondary: { main: brand.vinho, contrastText: brand.blush },
    background: {
      default: '#FFF5FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F0914',
      secondary: '#7A4A62',
    },
    divider: '#F3CFE1',
  },
  components: {
    ...shared.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: brand.vinho,
          color: brand.blush,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #F3CFE1',
          boxShadow: '0 1px 2px rgba(61,10,34,0.06)',
        },
      },
    },
  },
})

export const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: 'dark',
    primary: { main: brand.neon, light: brand.blush, dark: brand.magenta, contrastText: brand.noite },
    secondary: { main: brand.blush, contrastText: brand.noite },
    background: {
      default: brand.noite,
      paper: '#12060D',
    },
    text: {
      primary: '#FDEEF6',
      secondary: '#C9A3B6',
    },
    divider: brand.vinho,
  },
  components: {
    ...shared.components,
    MuiPaper: {
      styleOverrides: {
        // remove o clareamento automático das superfícies no modo escuro
        root: { backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: brand.noite,
          color: brand.blush,
          borderBottom: `1px solid ${brand.vinho}`,
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${brand.vinho}`,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#0D0408',
          borderTop: `1px solid ${brand.vinho}`,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        primary: {
          boxShadow: '0 0 24px rgba(255,79,163,0.5)',
        },
      },
    },
  },
})
