import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
} from '@mui/material'
import {
  Receipt,
  Inventory,
  History,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

const roleLabels = {
  garcom: 'Garçom',
  caixa: 'Caixa',
  admin: 'Administrador',
}

const menuItems = [
  {
    title: 'Comandas',
    description: 'Abrir, lançar pedidos e fechar contas',
    icon: Receipt,
    color: '#1565C0',
    path: '/comandas',
    ready: false,
  },
  {
    title: 'Estoque',
    description: 'Produtos, entradas e controle de doses',
    icon: Inventory,
    color: '#2E7D32',
    path: '/estoque',
    ready: true,
  },
  {
    title: 'Histórico',
    description: 'Comandas fechadas e pagamentos',
    icon: History,
    color: '#E65100',
    path: '/historico',
    ready: false,
  },
]

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Olá, {profile?.name}
        </Typography>
        <Chip
          label={roleLabels[profile?.role ?? 'garcom']}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mt: 0.5 }}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}
      >
        {menuItems.map((item) => (
          <Card key={item.title}>
            <CardActionArea
              sx={{ p: 1 }}
              onClick={() => item.ready && navigate(item.path)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <item.icon
                  sx={{ fontSize: 48, color: item.color, mb: 1 }}
                />
                <Typography variant="h6" fontWeight={600}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
                {!item.ready && (
                  <Chip
                    label="Em breve"
                    size="small"
                    sx={{ mt: 1 }}
                    variant="outlined"
                  />
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
