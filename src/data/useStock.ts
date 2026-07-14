import { useState } from 'react'

export type VarietyId = 'ponni' | 'sona' | 'basmati' | 'idli' | 'black' | 'brown'

export interface StockEntry {
  id: string
  varietyId: VarietyId
  varietyName: string
  quantity: number
  price: number
  threshold: number
  max: number
  lastUpdated: string
}

const INITIAL_STOCK: StockEntry[] = [
  { id: '1', varietyId: 'ponni', varietyName: 'Ponni Boiled', quantity: 4500, price: 42, threshold: 2000, max: 10000, lastUpdated: '2026-07-14' },
  { id: '2', varietyId: 'sona', varietyName: 'Sona Masuri', quantity: 1200, price: 54, threshold: 2000, max: 10000, lastUpdated: '2026-07-13' },
  { id: '3', varietyId: 'basmati', varietyName: 'Basmati Premium', quantity: 8000, price: 110, threshold: 3000, max: 15000, lastUpdated: '2026-07-14' },
  { id: '4', varietyId: 'idli', varietyName: 'Idli Rice', quantity: 3500, price: 38, threshold: 1500, max: 8000, lastUpdated: '2026-07-12' },
]

// TODO: replace with API call
export function useStock() {
  const [stock, setStock] = useState<StockEntry[]>(INITIAL_STOCK)

  const updateQuantity = (id: string, newQuantity: number) => {
    setStock(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString().split('T')[0] } : item))
  }

  const deleteStock = (id: string) => {
    setStock(prev => prev.filter(item => item.id !== id))
  }

  const addStock = (entry: Omit<StockEntry, 'id' | 'lastUpdated'>) => {
    const newEntry: StockEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString().split('T')[0]
    }
    setStock(prev => [...prev, newEntry])
  }

  return { stock, updateQuantity, deleteStock, addStock }
}
