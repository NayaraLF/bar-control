import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Chip,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCollection } from '../hooks/useFirestore'
import { formatCurrency } from '../utils/format'
import type { Comanda } from '../types'

export default function Comandas() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { data: comandas, loading } = useCollection<Comanda>('comandas', 'createdAt')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [saving, setSaving] = useState(false)

  const openComandas = comandas.filter((c) => c.status === 'open')

  async function handleCreate() {
    if (!label.trim()) return
    setSaving(true)
    try {
      const docRef = await addDoc(collection(db, 'comandas'), {
        label: label.trim(),
        status: 'open',
        items: [],
        total: 0,
        createdBy: profile?.uid ?? '',
        createdAt: serverTimestamp(),
      })
      setDialogOpen(false)
      setLabel('')
      navigate(`/comandas/${docRef.id}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Typography sx={{ p: 2 }}>Carregando...</Typography>

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Comandas Abertas
      </Typography>

      {openComandas.length === 0 ? (
        <Alert severity="info">
          Nenhuma comanda aberta. Toque no + para abrir uma nova.
        </Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {openComandas.map((comanda) => (
            <Card key={comanda.id}>
              <CardActionArea
                onClick={() => navigate(`/comandas/${comanda.id}`)}
                sx={{ p: 1 }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600}>
                    {comanda.label}
                  </Typography>
                  <Chip
                    label={`${comanda.items.length} ${comanda.items.length === 1 ? 'item' : 'itens'}`}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                  <Typography variant="h5" fontWeight={700} color="primary" sx={{ mt: 1 }}>
                    {formatCurrency(comanda.total)}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      <Fab
        color="primary"
        onClick={() => setDialogOpen(true)}
        sx={{ position: 'fixed', bottom: { xs: 80, md: 24 }, right: 24 }}
      >
        <Add />
      </Fab>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Nova Comanda</DialogTitle>
        <DialogContent>
          <TextField
            label="Mesa ou nome do cliente"
            fullWidth
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            sx={{ mt: 1 }}
            autoFocus
            placeholder="Ex: Mesa 5, João"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={saving || !label.trim()}
          >
            Abrir Comanda
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
