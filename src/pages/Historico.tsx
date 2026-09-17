import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import { useCollection } from '../hooks/useFirestore'
import { formatCurrency } from '../utils/format'
import type { Comanda, PaymentMethod } from '../types'

const methodLabels: Record<PaymentMethod, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  debito: 'Cartão de Débito',
  credito: 'Cartão de Crédito',
}

function formatDate(timestamp: unknown): string {
  if (!timestamp || typeof timestamp !== 'object') return ''
  const ts = timestamp as { toDate?: () => Date }
  if (!ts.toDate) return ''
  return ts.toDate().toLocaleString('pt-BR')
}

export default function Historico() {
  const { data: comandas, loading } = useCollection<Comanda>('comandas', 'createdAt')
  const [selectedComanda, setSelectedComanda] = useState<Comanda | null>(null)

  const closedComandas = comandas
    .filter((c) => c.status === 'closed')
    .reverse()

  if (loading) return <Typography sx={{ p: 2 }}>Carregando...</Typography>

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Histórico de Comandas
      </Typography>

      {closedComandas.length === 0 ? (
        <Alert severity="info">Nenhuma comanda fechada ainda.</Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          {closedComandas.map((comanda) => (
            <Card key={comanda.id}>
              <CardActionArea onClick={() => setSelectedComanda(comanda)}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {comanda.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {formatCurrency(comanda.total)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(comanda.closedAt)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                    {comanda.payments?.map((p, i) => (
                      <Chip
                        key={i}
                        label={`${methodLabels[p.method]}: ${formatCurrency(p.amount)}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      <Dialog
        open={Boolean(selectedComanda)}
        onClose={() => setSelectedComanda(null)}
        fullWidth
        maxWidth="sm"
      >
        {selectedComanda && (
          <>
            <DialogTitle>
              {selectedComanda.label}
              <Typography variant="body2" color="text.secondary">
                Fechada em {formatDate(selectedComanda.closedAt)}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Itens consumidos
              </Typography>
              <List dense disablePadding>
                {selectedComanda.items.map((item, index) => (
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
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Pagamentos
              </Typography>
              <List dense disablePadding>
                {selectedComanda.payments?.map((payment, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={methodLabels[payment.method]}
                      secondary={
                        payment.change
                          ? `Recebido: ${formatCurrency(payment.received!)} — Troco: ${formatCurrency(payment.change)}`
                          : undefined
                      }
                    />
                    <Typography fontWeight={600}>
                      {formatCurrency(payment.amount)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Total
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary">
                  {formatCurrency(selectedComanda.total)}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedComanda(null)}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}
