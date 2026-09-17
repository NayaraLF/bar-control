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
  InputAdornment,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useCollection } from '../../hooks/useFirestore'
import { formatCurrency, parseCurrencyInput, unitLabels, formatStock } from '../../utils/format'
import type { Category, StockItem, Product } from '../../types'

export default function ProductTab() {
  const { data: products, loading } = useCollection<Product>('products', 'name')
  const { data: categories } = useCollection<Category>('categories', 'name')
  const { data: stockItems } = useCollection<StockItem>('stockItems', 'name')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    price: '',
    stockItemId: '',
    consumptionPerUnit: '',
    isActive: true,
  })
  const [saving, setSaving] = useState(false)

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  const stockItemMap = Object.fromEntries(stockItems.map((s) => [s.id, s]))
  const activeStockItems = stockItems.filter((s) => s.isActive)

  const selectedStockItem = form.stockItemId ? stockItemMap[form.stockItemId] : null

  function openAdd() {
    setEditingId(null)
    setForm({ name: '', categoryId: '', price: '', stockItemId: '', consumptionPerUnit: '', isActive: true })
    setDialogOpen(true)
  }

  function openEdit(product: Product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price.toFixed(2).replace('.', ','),
      stockItemId: product.stockItemId,
      consumptionPerUnit: String(product.consumptionPerUnit),
      isActive: product.isActive,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    const price = parseCurrencyInput(form.price)
    if (!form.name.trim() || !form.categoryId || price <= 0) return
    setSaving(true)
    try {
      const data = {
        name: form.name.trim(),
        categoryId: form.categoryId,
        price,
        stockItemId: form.stockItemId || '',
        consumptionPerUnit: parseFloat(form.consumptionPerUnit) || 0,
        isActive: form.isActive,
      }
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), data)
      } else {
        await addDoc(collection(db, 'products'), data)
      }
      setDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Typography>Carregando...</Typography>

  return (
    <Box>
      {products.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhum produto cadastrado. Toque no + para adicionar.
        </Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
          {products.map((product) => {
            const stockItem = stockItemMap[product.stockItemId]
            return (
              <Card
                key={product.id}
                sx={{ cursor: 'pointer', opacity: product.isActive ? 1 : 0.5 }}
                onClick={() => openEdit(product)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {product.name}
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight={700}>
                      {formatCurrency(product.price)}
                    </Typography>
                  </Box>
                  {categoryMap[product.categoryId] && (
                    <Chip
                      label={categoryMap[product.categoryId]}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                  {stockItem && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Consome {product.consumptionPerUnit} {unitLabels[stockItem.unit]} de{' '}
                      {stockItem.name}
                    </Typography>
                  )}
                  {!product.isActive && (
                    <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
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
        <DialogTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome do produto"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mt: 1 }}
            autoFocus
            placeholder="Ex: Dose de Cachaça"
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
            label="Preço de venda"
            fullWidth
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            sx={{ mt: 2 }}
            placeholder="8,50"
            slotProps={{
              input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> },
            }}
          />
          <TextField
            label="Item de estoque vinculado"
            select
            fullWidth
            value={form.stockItemId}
            onChange={(e) => setForm({ ...form, stockItemId: e.target.value })}
            sx={{ mt: 2 }}
            helperText="Qual item do estoque é consumido quando este produto é vendido?"
          >
            <MenuItem value="">Nenhum (sem controle de estoque)</MenuItem>
            {activeStockItems.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name} ({formatStock(item.currentStock, item.unit)})
              </MenuItem>
            ))}
          </TextField>
          {selectedStockItem && (
            <>
              <TextField
                label={`Consumo por unidade vendida (${unitLabels[selectedStockItem.unit]})`}
                type="number"
                fullWidth
                value={form.consumptionPerUnit}
                onChange={(e) => setForm({ ...form, consumptionPerUnit: e.target.value })}
                sx={{ mt: 2 }}
                placeholder={selectedStockItem.unit === 'un' ? '1' : '50'}
                slotProps={{
                  htmlInput: { min: 0, step: selectedStockItem.unit === 'un' ? 1 : 0.1 },
                }}
              />
              {form.name && parseFloat(form.consumptionPerUnit) > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Cada "{form.name}" vendido vai descontar{' '}
                  <strong>
                    {form.consumptionPerUnit} {unitLabels[selectedStockItem.unit]}
                  </strong>{' '}
                  de "{selectedStockItem.name}"
                  {selectedStockItem.unit === 'ml' &&
                    selectedStockItem.currentStock > 0 &&
                    parseFloat(form.consumptionPerUnit) > 0 && (
                      <>
                        {' '}
                        (rende{' '}
                        {Math.floor(
                          selectedStockItem.currentStock / parseFloat(form.consumptionPerUnit)
                        )}{' '}
                        unidades com o estoque atual)
                      </>
                    )}
                </Alert>
              )}
            </>
          )}
          {editingId && (
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
              }
              label="Produto ativo"
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !form.name.trim() || !form.categoryId || parseCurrencyInput(form.price) <= 0}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
