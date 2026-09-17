import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Link,
  CircularProgress,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  LocalBar,
  DarkMode,
  LightMode,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useThemeMode } from '../contexts/ThemeContext'

export default function Login() {
  const { signIn } = useAuth()
  const { mode, toggleTheme } = useThemeMode()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
        setError('E-mail ou senha incorretos')
      } else if (code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde um momento e tente novamente.')
      } else {
        setError('Erro ao entrar. Verifique sua conexão.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <IconButton onClick={toggleTheme} color="inherit">
          {mode === 'dark' ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <LocalBar sx={{ fontSize: 56, color: 'secondary.main', mb: 1 }} />
        <Typography variant="h4" fontWeight={700}>
          BarControl
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sistema de Gestão para Bar
        </Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Entrar
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="email"
              autoFocus
            />
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              autoComplete="current-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Peça ao administrador para criar sua conta.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
