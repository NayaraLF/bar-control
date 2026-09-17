import type { Timestamp } from 'firebase/firestore'

export interface Category {
  id: string
  name: string
}

export interface StockItem {
  id: string
  name: string
  categoryId: string
  unit: 'un' | 'ml' | 'g'
  currentStock: number
  minStock: number
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  categoryId: string
  price: number
  stockItemId: string
  consumptionPerUnit: number
  isActive: boolean
}

export interface StockMovement {
  id: string
  stockItemId: string
  type: 'entry' | 'sale' | 'return' | 'adjustment'
  quantity: number
  previousStock: number
  newStock: number
  createdBy: string
  createdAt: Timestamp
  notes: string
}

export interface ComandaItem {
  id: string
  productId: string
  productName: string
  price: number
  quantity: number
  stockItemId: string
  consumptionPerUnit: number
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'debito' | 'credito'

export interface Payment {
  method: PaymentMethod
  amount: number
  received?: number
  change?: number
}

export interface Comanda {
  id: string
  label: string
  status: 'open' | 'closed'
  items: ComandaItem[]
  total: number
  payments?: Payment[]
  createdBy: string
  createdAt: Timestamp
  closedBy?: string
  closedAt?: Timestamp
}
