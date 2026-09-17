import { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Chip,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useCollection } from '../../hooks/useFirestore'
import { formatStock, unitLabelsFull } from '../../utils/format'
import type { Category, StockItem } from '../../types'

const units = [
  { value: 'un', label: 'Unidade (un) — cervejas, petiscos' },
  { value: 'ml', label: 'Mililitros (ml) — destilados, drinks' },
  { value: 'g', label: 'Gramas (g) — porções' },
]

function stockStatus(item: StockItem) {
  if (item.currentStock <= 0) return { label: 'Zerado', color: 'error' as const }
  if (item.currentStock <= item.minStock) return { label: 'Baixo', color: 'warning' as const }
  return { label: 'OK', color: 'success' as const }
}

export default function StockItemTab() {
  const { data: items, loading } = useCollection<StockItem>('stockItems', 'name')
  const { data: categories } = useCollection<Category>('categories', 'name')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    unit: 'un' as string,
    currentStock: '',
    minStock: '',
    isActive: true,
  })
  const [saving, setSaving] = useState(false)

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))

  function openAdd() {
    setEditingId(null)
    setForm({ name: '', categoryId: '', unit: 'un', currentStock: '', minStock: '', isActive: true })
    setDialogOpen(true)
  }

  function openEdit(item: StockItem) {
    setEditingId(item.id)
    setForm({
      name: item.name,
      categoryId: item.categoryId,
      unit: item.unit,
      currentStock: String(item.currentStock),
      minStock: String(item.minStock),
      isActive: item.isActive,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.categoryId) return
    setSaving(true)
    try {
      const data = {
        name: form.name.trim(),
        categoryId: form.categoryId,
        unit: form.unit,
        minStock: parseFloat(form.minStock) || 0,
        isActive: form.isActive,
      }
      if (editingId) {
        await updateDoc(doc(db, 'stockItems', editingId), data)
      } else {
        await addDoc(collection(db, 'stockItems'), {
          ...data,
          currentStock: parseFloat(form.currentStock) || 0,
        })
      }
      setDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Typography>Carregando...</Typography>

  return (
    <Box>
      {items.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhum item de estoque cadastrado. Toque no + para adicionar.
        </Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
          {items.map((item) => {
            const status = stockStatus(item)
            return (
              <Card
                key={item.id}
                sx={{ cursor: 'pointer', opacity: item.isActive ? 1 : 0.5 }}
                onClick={() => openEdit(item)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {item.name}
                    </Typography>
                    <Chip label={status.label} color={status.color} size="small" />
                  </Box>
                  {categoryMap[item.categoryId] && (
                    <Chip
                      label={categoryMap[item.categoryId]}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {formatStock(item.currentStock, item.unit)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Mínimo: {formatStock(item.minStock, item.unit)}
                  </Typography>
                  {!item.isActive && (
                    <Typography variant="caption" color="error" display="block">
                      Desativado
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </Box>
      )}

      <Fab
        color="primary"
        onClick={openAdd}
        sx={{ position: 'fixed', bottom: { xs: 80, md: 24 }, right: 24 }}
      >
        <Add />
      </Fab>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Editar Item de Estoque' : 'Novo Item de Estoque'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mt: 1 }}
            autoFocus
            placeholder="Ex: Cachaça Velho Barreiro"
          />
          <TextField
            label="Categoria"
            select
            fullWidth
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            sx={{ mt: 2 }}
          >
            {categories.length === 0 ? (
              <MenuItem disabled>Cadastre categorias primeiro</MenuItem>
            ) : (
              categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))
            )}
          </TextField>
          <TextField
            label="Unidade de controle"
            select
            fullWidth
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            sx={{ mt: 2 }}
            helperText={`Estoque será contado em ${unitLabelsFull[form.unit]}`}
          >
            {units.map((u) => (
              <MenuItem key={u.value} value={u.value}>
                {u.label}
              </MenuItem>
            ))}
          </TextField>
          {!editingId && (
            <TextField
              label="Estoque inicial"
              type="number"
              fullWidth
              value={form.currentStock}
              onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
              sx={{ mt: 2 }}
              placeholder="0"
              slotProps={{ htmlInput: { min: 0, step: form.unit === 'un' ? 1 : 0.1 } }}
            />
          )}
          <TextField
            label="Estoque mínimo (para alerta)"
            type="number"
            fullWidth
            value={form.minStock}
            onChange={(e) => setForm({ ...form, minStock: e.target.value })}
            sx={{ mt: 2 }}
            placeholder="0"
            helperText="Alerta aparece quando o estoque ficar igual ou abaixo deste valor"
            slotProps={{ htmlInput: { min: 0, step: form.unit === 'un' ? 1 : 0.1 } }}
          />
          {editingId && (
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
              }
              label="Item ativo"
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !form.name.trim() || !form.categoryId}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
