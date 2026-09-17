import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItemButton,
  Divider,
  Chip,
} from '@mui/material'
import {
  LocalBar,
  DarkMode,
  LightMode,
  Receipt,
  Inventory,
  History,
  AccountCircle,
  Logout,
  Menu as MenuIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useThemeMode } from '../contexts/ThemeContext'

const navItems = [
  { label: 'Comandas', icon: <Receipt />, path: '/' },
  { label: 'Estoque', icon: <Inventory />, path: '/estoque' },
  { label: 'Histórico', icon: <History />, path: '/historico' },
]

const roleLabels = {
  garcom: 'Garçom',
  caixa: 'Caixa',
  admin: 'Admin',
}

export default function Layout() {
  const { profile, signOut } = useAuth()
  const { mode, toggleTheme } = useThemeMode()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const currentNav = navItems.findIndex((item) => item.path === location.pathname)

  async function handleSignOut() {
    setMenuAnchor(null)
    await signOut()
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar>
          {!isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <LocalBar sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            BarControl
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
          <IconButton
            color="inherit"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography fontWeight={600}>{profile?.name}</Typography>
              <Chip
                label={roleLabels[profile?.role ?? 'garcom']}
                size="small"
                variant="outlined"
              />
            </Box>
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Sair</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer lateral para desktop */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalBar color="secondary" />
            <Typography variant="h6" fontWeight={700}>
              BarControl
            </Typography>
          </Box>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path)
                  setDrawerOpen(false)
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          pb: isMobile ? 9 : 2,
          maxWidth: 1200,
          mx: 'auto',
          width: '100%',
        }}
      >
        <Outlet />
      </Box>

      {/* Navegação inferior no celular */}
      {isMobile && (
        <Paper
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }}
          elevation={8}
        >
          <BottomNavigation
            value={currentNav === -1 ? 0 : currentNav}
            onChange={(_, newValue) => {
              navigate(navItems[newValue].path)
            }}
            showLabels
          >
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  )
}
