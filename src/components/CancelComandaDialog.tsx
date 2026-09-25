import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material'
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency } from '../utils/format'
import type { UserRole } from '../contexts/AuthContext'
import type { Comanda, ComandaItem } from '../types'

/** Só Caixa e Admin podem excluir comandas sem pagamento. */
export function canCancelComanda(role?: UserRole) {
  return role === 'caixa' || role === 'admin'
}

interface Props {
  comanda: Comanda | null
  onClose: () => void
  onCancelled?: () => void
}

export default function CancelComandaDialog({ comanda, onClose, onCancelled }: Props) {
  const { profile } = useAuth()
  const [returnStock, setReturnStock] = useState(true)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // reinicia o formulário a cada comanda aberta na janela
  useEffect(() => {
    if (comanda) {
      setReturnStock(true)
      setReason('')
      setError('')
    }
  }, [comanda])

  async function handleConfirm() {
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
          cancelReason: reason.trim(),
          stockReturned: returnStock && toReturn.size > 0,
        })
      })

      onClose()
      onCancelled?.()
    } catch {
      setError('Erro ao excluir a comanda. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={Boolean(comanda)}
      onClose={() => !saving && onClose()}
      fullWidth
      maxWidth="xs"
    >
      {comanda && (
        <>
          <DialogTitle>Excluir comanda?</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
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
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: comanda aberta por engano"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={saving}>
              Voltar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirm}
              disabled={saving}
            >
              Excluir Comanda
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}
