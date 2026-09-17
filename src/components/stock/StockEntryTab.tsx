import { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import {
  doc,
  collection,
  runTransaction,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore'
import { useState as useStateAlias, useEffect } from 'react'
import { db } from '../../services/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { useCollection } from '../../hooks/useFirestore'
import { formatStock, unitLabels } from '../../utils/format'
import type { StockItem, StockMovement } from '../../types'

export default function StockEntryTab() {
  const { profile } = useAuth()
  const { data: stockItems } = useCollection<StockItem>('stockItems', 'name')

  const [selectedItemId, setSelectedItemId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [recentEntries, setRecentEntries] = useStateAlias<(StockMovement & { id: string })[]>([])

  useEffect(() => {
    const q = query(
      collection(db, 'stockMovements'),
      where('type', '==', 'entry'),
      orderBy('createdAt', 'desc'),
      limit(15)
    )
    return onSnapshot(q, (snap) => {
      setRecentEntries(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StockMovement & { id: string })
      )
    })
  }, [])

  const activeItems = stockItems.filter((s) => s.isActive)
  const selectedItem = stockItems.find((s) => s.id === selectedItemId)
  const stockItemMap = Object.fromEntries(stockItems.map((s) => [s.id, s]))

  async function handleEntry() {
    const qty = parseFloat(quantity)
    if (!selectedItemId || !qty || qty <= 0) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const itemRef = doc(db, 'stockItems', selectedItemId)

      await runTransaction(db, async (transaction) => {
        const itemDoc = await transaction.get(itemRef)
        const currentStock = itemDoc.data()?.currentStock ?? 0
        const newStock = currentStock + qty

        transaction.update(itemRef, { currentStock: newStock })

        const movementRef = doc(collection(db, 'stockMovements'))
        transaction.set(movementRef, {
          stockItemId: selectedItemId,
          type: 'entry',
          quantity: qty,
          previousStock: currentStock,
          newStock,
          createdBy: profile?.uid ?? '',
          createdAt: serverTimestamp(),
          notes: notes.trim(),
        })
      })

      const itemName = selectedItem?.name ?? ''
      const unit = selectedItem?.unit ?? 'un'
      setSuccess(`Entrada registrada: +${qty} ${unitLabels[unit]} de ${itemName}`)
      setQuantity('')
      setNotes('')
    } catch {
      setError('Erro ao registrar entrada. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  function formatDate(timestamp: unknown): string {
    if (!timestamp || typeof timestamp !== 'object') return ''
    const ts = timestamp as { toDate?: () => Date }
    if (!ts.toDate) return ''
    return ts.toDate().toLocaleString('pt-BR')
  }

  return (
    <Box>
      <Card sx={{ mt: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dar entrada de mercadoria
          </Typography>

          <TextField
            label="Item de estoque"
            select
            fullWidth
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            sx={{ mt: 1 }}
          >
            {activeItems.length === 0 ? (
              <MenuItem disabled>Cadastre itens de estoque primeiro</MenuItem>
            ) : (
              activeItems.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name} (atual: {formatStock(item.currentStock, item.unit)})
                </MenuItem>
              ))
            )}
          </TextField>

          {selectedItem && (
            <TextField
              label={`Quantidade a adicionar (${unitLabels[selectedItem.unit]})`}
              type="number"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              sx={{ mt: 2 }}
              slotProps={{
                htmlInput: { min: 0, step: selectedItem.unit === 'un' ? 1 : 0.1 },
              }}
              helperText={
                quantity && parseFloat(quantity) > 0
                  ? `Estoque ficará: ${formatStock(selectedItem.currentStock + parseFloat(quantity), selectedItem.unit)}`
                  : undefined
              }
            />
          )}

          <TextField
            label="Observação (opcional)"
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Ex: Compra do fornecedor X"
          />

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            startIcon={<Add />}
            onClick={handleEntry}
            disabled={saving || !selectedItemId || !quantity || parseFloat(quantity) <= 0}
            sx={{ mt: 2, py: 1.5 }}
          >
            Dar entrada
          </Button>
        </CardContent>
      </Card>

      {recentEntries.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Entradas recentes
          </Typography>
          <List>
            {recentEntries.map((entry, index) => {
              const item = stockItemMap[entry.stockItemId]
              return (
                <Box key={entry.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={`+${entry.quantity} ${item ? unitLabels[item.unit] : 'un'} de ${item?.name ?? 'Item removido'}`}
                      secondary={
                        <>
                          {formatDate(entry.createdAt)}
                          {entry.notes ? ` — ${entry.notes}` : ''}
                        </>
                      }
                    />
                  </ListItem>
                </Box>
              )
            })}
          </List>
        </Box>
      )}
    </Box>
  )
}
