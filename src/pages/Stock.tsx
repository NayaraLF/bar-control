import { useState } from 'react'
import { Box, Tabs, Tab } from '@mui/material'
import {
  ShoppingCart,
  Inventory,
  LocalShipping,
  Category,
} from '@mui/icons-material'
import ProductTab from '../components/stock/ProductTab'
import StockItemTab from '../components/stock/StockItemTab'
import StockEntryTab from '../components/stock/StockEntryTab'
import CategoryTab from '../components/stock/CategoryTab'

const tabs = [
  { label: 'Produtos', icon: <ShoppingCart /> },
  { label: 'Estoque', icon: <Inventory /> },
  { label: 'Entrada', icon: <LocalShipping /> },
  { label: 'Categorias', icon: <Category /> },
]

export default function Stock() {
  const [tab, setTab] = useState(0)

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 1, borderBottom: 1, borderColor: 'divider' }}
      >
        {tabs.map((t, i) => (
          <Tab key={i} icon={t.icon} label={t.label} iconPosition="start" />
        ))}
      </Tabs>

      {tab === 0 && <ProductTab />}
      {tab === 1 && <StockItemTab />}
      {tab === 2 && <StockEntryTab />}
      {tab === 3 && <CategoryTab />}
    </Box>
  )
}
