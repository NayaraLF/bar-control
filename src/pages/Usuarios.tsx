import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  List,
  ListItem,
  ListItemText,
  Chip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material'
import { Add, Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth, type UserRole } from '../contexts/AuthContext'
import { useCollection } from '../hooks/useFirestore'
import type { UserProfile } from '../contexts/AuthContext'

const roles: { value: UserRole; label: string }[] = [
  { value: 'garcom', label: 'Garçom' },
  { value: 'caixa', label: 'Caixa' },
  { value: 'admin', label: 'Administrador' },
]

const roleLabels: Record<UserRole, string> = {
  garcom: 'Garçom',
  caixa: 'Caixa',
  admin: 'Admin',
}

const roleColors: Record<UserRole, 'default' | 'primary' | 'error'> = {
  garcom: 'default',
  caixa: 'primary',
  admin: 'error',
}

export default function Usuarios() {
  const { profile, signUp } = useAuth()
  const { data: users, loading } = useCollection<UserProfile>('users', 'name')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('garcom')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (profile?.role !== 'admin') {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Apenas administradores podem gerenciar usuários.
        </Alert>
      </Box>
    )
  }

  function openDialog() {
    setName('')
    setEmail('')
    setPassword('')
    setRole('garcom')
    setError('')
    setSuccess('')
    setDialogOpen(true)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres')
      return
    }

    setSaving(true)
    try {
      await signUp(name, email, password, role)
      setSuccess(`Usuário "${name}" criado com sucesso!`)
      setDialogOpen(false)
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado')
      } else {
        setError('Erro ao criar usuário. Tente novamente.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Typography sx={{ p: 2 }}>Carregando...</Typography>

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Usuários
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {users.length === 0 ? (
        <Alert severity="info">Nenhum usuário cadastrado.</Alert>
      ) : (
        <Card>
          <List disablePadding>
            {users.map((user, index) => (
              <ListItem
                key={user.uid}
                divider={index < users.length - 1}
              >
                <ListItemText
                  primary={user.name}
                  secondary={user.email}
                />
                <Chip
                  label={roleLabels[user.role]}
                  size="small"
                  color={roleColors[user.role]}
                  variant="outlined"
                />
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      <Fab
        color="primary"
        onClick={openDialog}
        sx={{ position: 'fixed', bottom: { xs: 80, md: 24 }, right: 24 }}
      >
        <Add />
      </Fab>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Novo Usuário</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          <Box component="form" id="create-user-form" onSubmit={handleCreate}>
            <TextField
              label="Nome"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mt: 1 }}
              autoFocus
            />
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mt: 2 }}
            />
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mt: 2 }}
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
              label="Função"
              select
              fullWidth
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              sx={{ mt: 2 }}
            >
              {roles.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            type="submit"
            form="create-user-form"
            variant="contained"
            disabled={saving || !name.trim() || !email.trim() || password.length < 6}
          >
            Criar Usuário
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
