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
  MenuItem,
  CircularProgress,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  DarkMode,
  LightMode,
} from '@mui/icons-material'
import { useAuth, type UserRole } from '../contexts/AuthContext'
import { useThemeMode } from '../contexts/ThemeContext'
import { LogoIcon } from '../components/Logo'

const roles: { value: UserRole; label: string }[] = [
  { value: 'garcom', label: 'Garçom' },
  { value: 'caixa', label: 'Caixa' },
  { value: 'admin', label: 'Administrador' },
]

export default function Register() {
  const { signUp } = useAuth()
  const { mode, toggleTheme } = useThemeMode()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('garcom')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)
    try {
      await signUp(name, email, password, role)
      navigate('/')
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado')
      } else if (code === 'auth/weak-password') {
        setError('A senha precisa ter pelo menos 6 caracteres')
      } else if (code === 'auth/operation-not-allowed') {
        setError('Login por e-mail não está ativado no Firebase. Ative em Authentication > Sign-in method.')
      } else {
        setError(`Erro ao criar conta (${code ?? 'desconhecido'}). Verifique sua conexão.`)
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
          <LogoIcon size={64} glow={mode === 'dark'} />
        </Box>
        <Typography variant="h5" fontWeight={700}>
          Criar Conta
        </Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Nome"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
              autoFocus
            />
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="email"
            />
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="new-password"
              helperText="Mínimo 6 caracteres"
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
            <TextField
              label="Confirmar senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="new-password"
            />
            <TextField
              label="Função"
              select
              fullWidth
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              sx={{ mb: 3 }}
            >
              {roles.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Criar conta'}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center">
            Já tem conta?{' '}
            <Link component={RouterLink} to="/login">
              Entrar
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
