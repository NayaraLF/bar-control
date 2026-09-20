import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  AlertTitle,
  Box,
  IconButton,
  Chip,
} from '@mui/material'
import { Close, Warning } from '@mui/icons-material'
import { useCollection } from '../hooks/useFirestore'
import { formatStock } from '../utils/format'
import type { StockItem } from '../types'

export default function StockAlerts() {
  const { data: stockItems } = useCollection<StockItem>('stockItems', 'name')
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const alertItems = stockItems.filter(
    (item) =>
      item.isActive &&
      item.currentStock <= item.minStock &&
      !dismissed.has(item.id)
  )

  if (alertItems.length === 0) return null

  const zeroItems = alertItems.filter((item) => item.currentStock <= 0)
  const lowItems = alertItems.filter((item) => item.currentStock > 0)

  return (
    <Box sx={{ mb: 2 }}>
      {zeroItems.length > 0 && (
        <Alert
          severity="error"
          icon={<Warning />}
          sx={{ mb: 1, cursor: 'pointer' }}
          onClick={() => navigate('/estoque')}
          action={
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                const newDismissed = new Set(dismissed)
                zeroItems.forEach((i) => newDismissed.add(i.id))
                setDismissed(newDismissed)
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          <AlertTitle>Estoque zerado</AlertTitle>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {zeroItems.map((item) => (
              <Chip
                key={item.id}
                label={item.name}
                size="small"
                color="error"
                variant="outlined"
              />
            ))}
          </Box>
        </Alert>
      )}

      {lowItems.length > 0 && (
        <Alert
          severity="warning"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/estoque')}
          action={
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                const newDismissed = new Set(dismissed)
                lowItems.forEach((i) => newDismissed.add(i.id))
                setDismissed(newDismissed)
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          <AlertTitle>Estoque baixo</AlertTitle>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {lowItems.map((item) => (
              <Chip
                key={item.id}
                label={`${item.name} (${formatStock(item.currentStock, item.unit)})`}
                size="small"
                color="warning"
                variant="outlined"
              />
            ))}
          </Box>
        </Alert>
      )}
    </Box>
  )
}
