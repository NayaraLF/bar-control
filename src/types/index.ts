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
