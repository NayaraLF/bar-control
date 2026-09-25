import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  Chip,
  InputAdornment,
  MenuItem,
  DialogActions,
  DialogContentText,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import {
  ArrowBack,
  Add,
  Remove,
  Delete,
  Search,
  DeleteForever,
} from '@mui/icons-material'
import {
  doc,
  runTransaction,
  serverTimestamp,
  collection,
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCollection } from '../hooks/useFirestore'
import { formatCurrency } from '../utils/format'
import type { Comanda, Product, StockItem, Category, ComandaItem } from '../types'

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

export default function ComandaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const { data: comandas, loading } = useCollection<Comanda>('comandas')
  const { data: products } = useCollection<Product>('products', 'name')
  const { data: stockItems } = useCollection<StockItem>('stockItems', 'name')
  const { data: categories } = useCollection<Category>('categories', 'name')

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [returnStock, setReturnStock] = useState(true)
  const [cancelReason, setCancelReason] = useState('')

  const canCancel = profile?.role === 'caixa' || profile?.role === 'admin'

  const comanda = comandas.find((c) => c.id === id)
  const stockItemMap = useMemo(
    () => Object.fromEntries(stockItems.map((s) => [s.id, s])),
    [stockItems]
  )

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive),
    [products]
  )

  const filteredProducts = useMemo(() => {
    let list = activeProducts
    if (filterCategory) {
      list = list.filter((p) => p.categoryId === filterCategory)
    }
    if (searchText.trim()) {
      const term = searchText.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(term))
    }
    return list
  }, [activeProducts, filterCategory, searchText])

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  )

  if (loading) return <Typography sx={{ p: 2 }}>Carregando...</Typography>
  if (!comanda || comanda.status !== 'open') {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Comanda não encontrada ou já encerrada.</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Voltar
        </Button>
      </Box>
    )
  }

  async function addProduct(product: Product) {
    if (!comanda || saving) return
    setSaving(true)
    setError('')

    try {
      const comandaRef = doc(db, 'comandas', comanda.id)

      await runTransaction(db, async (transaction) => {
        const comandaSnap = await transaction.get(comandaRef)

        let stockSnap = null
        let stockRef = null
        if (product.stockItemId && product.consumptionPerUnit > 0) {
          stockRef = doc(db, 'stockItems', product.stockItemId)
          stockSnap = await transaction.get(stockRef)
        }

        const currentItems: ComandaItem[] = comandaSnap.data()?.items ?? []
        const existingIndex = currentItems.findIndex(
          (i) => i.productId === product.id
        )

        let newItems: ComandaItem[]
        if (existingIndex >= 0) {
          newItems = currentItems.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        } else {
          newItems = [
            ...currentItems,
            {
              id: generateId(),
              productId: product.id,
              productName: product.name,
              price: product.price,
              quantity: 1,
              stockItemId: product.stockItemId,
              consumptionPerUnit: product.consumptionPerUnit,
            },
          ]
        }

        const newTotal = newItems.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        )
        transaction.update(comandaRef, { items: newItems, total: newTotal })

        if (stockRef && stockSnap) {
          const currentStock = stockSnap.data()?.currentStock ?? 0
          const newStock = currentStock - product.consumptionPerUnit

          transaction.update(stockRef, { currentStock: newStock })

          const movementRef = doc(collection(db, 'stockMovements'))
          transaction.set(movementRef, {
            stockItemId: product.stockItemId,
            type: 'sale',
            quantity: product.consumptionPerUnit,
            previousStock: currentStock,
            newStock,
            createdBy: profile?.uid ?? '',
            createdAt: serverTimestamp(),
            notes: `Comanda: ${comanda.label} — ${product.name}`,
          })
        }
      })
    } catch {
      setError('Erro ao adicionar item. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function changeQuantity(itemId: string, delta: number) {
    if (!comanda || saving) return
    setSaving(true)
    setError('')

    try {
      const comandaRef = doc(db, 'comandas', comanda.id)

      await runTransaction(db, async (transaction) => {
        const comandaSnap = await transaction.get(comandaRef)
        const currentItems: ComandaItem[] = comandaSnap.data()?.items ?? []
        const item = currentItems.find((i) => i.id === itemId)
        if (!item) return

        let stockSnap = null
        let stockRef = null
        if (item.stockItemId && item.consumptionPerUnit > 0) {
          stockRef = doc(db, 'stockItems', item.stockItemId)
          stockSnap = await transaction.get(stockRef)
        }

        const newQty = item.quantity + delta
        let newItems: ComandaItem[]

        if (newQty <= 0) {
          newItems = currentItems.filter((i) => i.id !== itemId)
        } else {
          newItems = currentItems.map((i) =>
            i.id === itemId ? { ...i, quantity: newQty } : i
          )
        }

        const newTotal = newItems.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        )
        transaction.update(comandaRef, { items: newItems, total: newTotal })

        if (stockRef && stockSnap) {
          const currentStock = stockSnap.data()?.currentStock ?? 0
          const stockDelta = -delta * item.consumptionPerUnit
          const newStock = currentStock + stockDelta

          transaction.update(stockRef, { currentStock: newStock })

          const movementRef = doc(collection(db, 'stockMovements'))
          transaction.set(movementRef, {
            stockItemId: item.stockItemId,
            type: delta > 0 ? 'sale' : 'return',
            quantity: Math.abs(delta) * item.consumptionPerUnit,
            previousStock: currentStock,
            newStock,
            createdBy: profile?.uid ?? '',
            createdAt: serverTimestamp(),
            notes: `Comanda: ${comanda.label} — ${item.productName}`,
          })
        }
      })
    } catch {
      setError('Erro ao alterar quantidade. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function removeItem(itemId: string) {
    const item = comanda?.items.find((i) => i.id === itemId)
    if (!item) return
    await changeQuantity(itemId, -item.quantity)
  }

  async function cancelComanda() {
    if (!comanda || saving) return
    setSaving(true)
    setError('')

    try {
      const comandaRef = doc(db, 'comandas', comanda.id)

      await runTransaction(db, async (transaction) => {
        const comandaSnap = await transaction.get(comandaRef)
        if (comandaSnap.data()?.status !== 'open') {
          throw new Error('Comanda não está aberta')
        }
        const items: ComandaItem[] = comandaSnap.data()?.items ?? []

        // soma o consumo por item de estoque (vários produtos podem usar a mesma garrafa)
        const toReturn = new Map<string, number>()
        if (returnStock) {
          for (const item of items) {
            if (!item.stockItemId || item.consumptionPerUnit <= 0) continue
            const qty = item.quantity * item.consumptionPerUnit
            toReturn.set(item.stockItemId, (toReturn.get(item.stockItemId) ?? 0) + qty)
          }
        }

        // transações exigem todas as leituras antes das escritas
        const stockEntries = await Promise.all(
          [...toReturn].map(async ([stockItemId, quantity]) => {
            const ref = doc(db, 'stockItems', stockItemId)
            const snap = await transaction.get(ref)
            return { stockItemId, quantity, ref, snap }
          })
        )

        for (const { stockItemId, quantity, ref, snap } of stockEntries) {
          if (!snap.exists()) continue
          const currentStock = snap.data()?.currentStock ?? 0
          const newStock = currentStock + quantity
          transaction.update(ref, { currentStock: newStock })
          transaction.set(doc(collection(db, 'stockMovements')), {
            stockItemId,
            type: 'return',
            quantity,
            previousStock: currentStock,
            newStock,
            createdBy: profile?.uid ?? '',
            createdAt: serverTimestamp(),
            notes: `Comanda excluída: ${comanda.label}`,
          })
        }

        transaction.update(comandaRef, {
          status: 'cancelled',
          cancelledBy: profile?.uid ?? '',
          cancelledAt: serverTimestamp(),
          cancelReason: cancelReason.trim(),
          stockReturned: returnStock && toReturn.size > 0,
        })
      })

      setCancelDialogOpen(false)
      navigate('/')
    } catch {
      setError('Erro ao excluir a comanda. Tente novamente.')
      setCancelDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  function getStockWarning(product: Product): string | null {
    if (!product.stockItemId) return null
    const stock = stockItemMap[product.stockItemId]
    if (!stock) return null
    if (stock.currentStock <= 0) return 'Estoque zerado'
    if (stock.currentStock <= stock.minStock) return 'Estoque baixo'
    return null
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            {comanda.label}
          </Typography>
        </Box>
        <Chip label="Aberta" color="success" size="small" />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {comanda.items.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Comanda vazia. Toque em "Adicionar" para lançar pedidos.
        </Alert>
      ) : (
        <Card sx={{ mb: 2 }}>
          <List disablePadding>
            {comanda.items.map((item, index) => (
              <Box key={item.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{ py: 1.5 }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => removeItem(item.id)}
                      disabled={saving}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography fontWeight={600}>{item.productName}</Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(item.price)} cada
                      </Typography>
                    }
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mr: 2,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => changeQuantity(item.id, -1)}
                      disabled={saving}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography
                      sx={{ minWidth: 28, textAlign: 'center' }}
                      fontWeight={600}
                    >
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => changeQuantity(item.id, 1)}
                      disabled={saving}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography fontWeight={700} sx={{ minWidth: 80, textAlign: 'right', mr: 1 }}>
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </ListItem>
              </Box>
            ))}
          </List>
        </Card>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Total
          </Typography>
          <Typography variant="h4" fontWeight={700} color="primary">
            {formatCurrency(comanda.total)}
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<Add />}
          onClick={() => {
            setSearchText('')
            setFilterCategory('')
            setAddDialogOpen(true)
          }}
          sx={{ py: 1.5 }}
          disabled={saving}
        >
          Adicionar Produto
        </Button>
        {comanda.items.length > 0 && (
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={() => navigate(`/comandas/${comanda.id}/fechar`)}
            sx={{ py: 1.5 }}
          >
            Fechar Conta
          </Button>
        )}
      </Box>

      {canCancel && (
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<DeleteForever />}
          onClick={() => {
            setReturnStock(true)
            setCancelReason('')
            setCancelDialogOpen(true)
          }}
          sx={{ mt: 2, py: 1.5 }}
          disabled={saving}
        >
          Excluir Comanda
        </Button>
      )}

      <Dialog
        open={cancelDialogOpen}
        onClose={() => !saving && setCancelDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Excluir comanda?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            A comanda <strong>{comanda.label}</strong> ({formatCurrency(comanda.total)}) será
            encerrada sem pagamento. Ela continua no Histórico marcada como Cancelada.
          </DialogContentText>
          {comanda.items.length > 0 && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={returnStock}
                    onChange={(e) => setReturnStock(e.target.checked)}
                  />
                }
                label="Devolver os itens ao estoque"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, ml: 4 }}>
                Desmarque se os itens já foram consumidos (ex.: cliente saiu sem pagar).
              </Typography>
            </>
          )}
          <TextField
            label="Motivo (opcional)"
            fullWidth
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Ex: comanda aberta por engano"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={saving}>
            Voltar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={cancelComanda}
            disabled={saving}
          >
            Excluir Comanda
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={false}
      >
        <DialogTitle>Adicionar Produto</DialogTitle>
        <DialogContent>
          <TextField
            placeholder="Buscar produto..."
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ mt: 1 }}
            autoFocus
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Filtrar por categoria"
            select
            fullWidth
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            sx={{ mt: 1 }}
            size="small"
          >
            <MenuItem value="">Todas</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>

          {filteredProducts.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Nenhum produto encontrado.
            </Alert>
          ) : (
            <List sx={{ mt: 1 }}>
              {filteredProducts.map((product) => {
                const warning = getStockWarning(product)
                return (
                  <Box key={product.id}>
                    <ListItem
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                        py: 1.5,
                      }}
                      onClick={() => {
                        addProduct(product)
                        setAddDialogOpen(false)
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontWeight={600}>
                              {product.name}
                            </Typography>
                            {warning && (
                              <Chip
                                label={warning}
                                size="small"
                                color={warning === 'Estoque zerado' ? 'error' : 'warning'}
                              />
                            )}
                          </Box>
                        }
                        secondary={categoryMap[product.categoryId]}
                      />
                      <Typography fontWeight={700} color="primary">
                        {formatCurrency(product.price)}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </Box>
                )
              })}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
