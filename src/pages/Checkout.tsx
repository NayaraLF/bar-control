import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  MenuItem,
  Alert,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from '@mui/material'
import { ArrowBack, Add, Delete } from '@mui/icons-material'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCollection } from '../hooks/useFirestore'
import { formatCurrency, parseCurrencyInput } from '../utils/format'
import type { Comanda, Payment, PaymentMethod } from '../types'

const methodLabels: Record<PaymentMethod, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  debito: 'Cartão de Débito',
  credito: 'Cartão de Crédito',
}

type SplitMode = 'none' | 'equal'

export default function Checkout() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const { data: comandas, loading } = useCollection<Comanda>('comandas')
  const comanda = comandas.find((c) => c.id === id)

  const [splitMode, setSplitMode] = useState<SplitMode>('none')
  const [splitCount, setSplitCount] = useState('2')
  const [payments, setPayments] = useState<Payment[]>([])
  const [payMethod, setPayMethod] = useState<PaymentMethod>('pix')
  const [payAmount, setPayAmount] = useState('')
  const [cashReceived, setCashReceived] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const totalPaid = useMemo(
    () => payments.reduce((sum, p) => sum + p.amount, 0),
    [payments]
  )

  const remaining = useMemo(
    () => Math.round(((comanda?.total ?? 0) - totalPaid) * 100) / 100,
    [comanda?.total, totalPaid]
  )

  const perPerson = useMemo(() => {
    if (splitMode !== 'equal' || !comanda) return 0
    const count = parseInt(splitCount) || 1
    return Math.ceil((comanda.total / count) * 100) / 100
  }, [splitMode, splitCount, comanda])

  if (loading) return <Typography sx={{ p: 2 }}>Carregando...</Typography>
  if (!comanda || comanda.status === 'closed') {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Comanda não encontrada ou já fechada.</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Voltar
        </Button>
      </Box>
    )
  }

  function addPayment() {
    let amount = parseCurrencyInput(payAmount)
    if (amount <= 0) return

    if (amount > remaining) {
      amount = Math.round(remaining * 100) / 100
    }

    const payment: Payment = { method: payMethod, amount }

    if (payMethod === 'dinheiro') {
      const received = parseCurrencyInput(cashReceived)
      if (received < amount) return
      payment.received = received
      payment.change = Math.round((received - amount) * 100) / 100
    }

    setPayments([...payments, payment])
    setPayAmount('')
    setCashReceived('')
  }

  function removePayment(index: number) {
    setPayments(payments.filter((_, i) => i !== index))
  }

  function fillRemaining() {
    if (remaining > 0) {
      setPayAmount(remaining.toFixed(2).replace('.', ','))
      if (payMethod === 'dinheiro') {
        setCashReceived(remaining.toFixed(2).replace('.', ','))
      }
    }
  }

  async function handleClose() {
    if (remaining > 0 || payments.length === 0) return
    setSaving(true)
    setError('')

    try {
      await updateDoc(doc(db, 'comandas', comanda!.id), {
        status: 'closed',
        payments,
        closedBy: profile?.uid ?? '',
        closedAt: serverTimestamp(),
      })
      navigate('/')
    } catch {
      setError('Erro ao fechar comanda. Tente novamente.')
      setSaving(false)
    }
  }

  const cashAmount = parseCurrencyInput(payAmount)
  const cashReceivedAmount = parseCurrencyInput(cashReceived)
  const cashChange =
    payMethod === 'dinheiro' && cashReceivedAmount >= cashAmount && cashAmount > 0
      ? Math.round((cashReceivedAmount - cashAmount) * 100) / 100
      : 0

  const canAddPayment =
    parseCurrencyInput(payAmount) > 0 &&
    (payMethod !== 'dinheiro' || cashReceivedAmount >= cashAmount)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(`/comandas/${comanda.id}`)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Fechar — {comanda.label}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Resumo dos itens */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Resumo do consumo
          </Typography>
        </CardContent>
        <List dense disablePadding>
          {comanda.items.map((item, index) => (
            <Box key={item.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemText
                  primary={`${item.quantity}x ${item.productName}`}
                />
                <Typography fontWeight={600}>
                  {formatCurrency(item.price * item.quantity)}
                </Typography>
              </ListItem>
            </Box>
          ))}
          <Divider />
          <ListItem>
            <ListItemText
              primary={<Typography fontWeight={700}>Total</Typography>}
            />
            <Typography variant="h6" fontWeight={700} color="primary">
              {formatCurrency(comanda.total)}
            </Typography>
          </ListItem>
        </List>
      </Card>

      {/* Divisão da conta */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Dividir conta
          </Typography>
          <ToggleButtonGroup
            value={splitMode}
            exclusive
            onChange={(_, v) => v && setSplitMode(v)}
            fullWidth
            size="small"
          >
            <ToggleButton value="none">Sem divisão</ToggleButton>
            <ToggleButton value="equal">Partes iguais</ToggleButton>
          </ToggleButtonGroup>

          {splitMode === 'equal' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Número de pessoas"
                type="number"
                fullWidth
                value={splitCount}
                onChange={(e) => setSplitCount(e.target.value)}
                slotProps={{ htmlInput: { min: 2, max: 50 } }}
              />
              {parseInt(splitCount) >= 2 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Cada pessoa paga{' '}
                  <strong>{formatCurrency(perPerson)}</strong>
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Pagamentos registrados */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Pagamentos
          </Typography>

          {payments.length > 0 && (
            <List dense disablePadding sx={{ mb: 2 }}>
              {payments.map((payment, index) => (
                <Box key={index}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removePayment(index)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={methodLabels[payment.method]}
                            size="small"
                            variant="outlined"
                          />
                          <Typography fontWeight={600}>
                            {formatCurrency(payment.amount)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        payment.change
                          ? `Recebido: ${formatCurrency(payment.received!)} — Troco: ${formatCurrency(payment.change)}`
                          : undefined
                      }
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          )}

          {remaining > 0 && (
            <>
              <Divider sx={{ mb: 2 }} />
              <TextField
                label="Forma de pagamento"
                select
                fullWidth
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                size="small"
              >
                {Object.entries(methodLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Valor"
                fullWidth
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                sx={{ mt: 1.5 }}
                placeholder="0,00"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">R$</InputAdornment>
                    ),
                    endAdornment: remaining > 0 && (
                      <InputAdornment position="end">
                        <Button size="small" onClick={fillRemaining}>
                          Restante
                        </Button>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {payMethod === 'dinheiro' && cashAmount > 0 && (
                <>
                  <TextField
                    label="Valor recebido"
                    fullWidth
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    sx={{ mt: 1.5 }}
                    placeholder="0,00"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">R$</InputAdornment>
                        ),
                      },
                    }}
                  />
                  {cashChange > 0 && (
                    <Alert severity="success" sx={{ mt: 1 }}>
                      Troco: <strong>{formatCurrency(cashChange)}</strong>
                    </Alert>
                  )}
                </>
              )}

              <Button
                variant="outlined"
                fullWidth
                startIcon={<Add />}
                onClick={addPayment}
                disabled={!canAddPayment}
                sx={{ mt: 1.5 }}
              >
                Registrar Pagamento
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Saldo */}
      <Card
        sx={{
          mb: 2,
          bgcolor: remaining <= 0 ? 'success.main' : 'warning.main',
          color: 'white',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {remaining <= 0 ? 'Conta quitada!' : 'Falta pagar'}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {remaining <= 0
              ? formatCurrency(0)
              : formatCurrency(remaining)}
          </Typography>
        </CardContent>
      </Card>

      {/* Botão fechar */}
      <Button
        variant="contained"
        fullWidth
        color="success"
        onClick={handleClose}
        disabled={saving || remaining > 0 || payments.length === 0}
        sx={{ py: 1.5, fontSize: '1.1rem' }}
      >
        {saving ? 'Fechando...' : 'Fechar Comanda'}
      </Button>
    </Box>
  )
}
