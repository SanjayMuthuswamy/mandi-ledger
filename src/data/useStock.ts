import { useEffect, useState } from 'react'

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

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function useStock() {
  const [stock, setStock] = useState<StockEntry[]>(INITIAL_STOCK)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadStock() {
      try {
        const response = await fetch(`${API_URL}/api/stock`)
        if (!response.ok) {
          throw new Error('Unable to load stock')
        }

        const entries = await response.json() as StockEntry[]
        if (isMounted) {
          setStock(entries)
        }
      } catch {
        if (isMounted) {
          setStock(INITIAL_STOCK)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStock()

    return () => {
      isMounted = false
    }
  }, [])

  const updateQuantity = async (id: string, newQuantity: number) => {
    const lastUpdated = new Date().toISOString().split('T')[0]
    setStock(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity, lastUpdated } : item))

    try {
      const response = await fetch(`${API_URL}/api/stock/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        const updatedEntry = await response.json() as StockEntry
        setStock(prev => prev.map(item => item.id === id ? updatedEntry : item))
      }
    } catch {
      // Keep the optimistic local update when the development API is offline.
    }
  }

  const deleteStock = async (id: string) => {
    setStock(prev => prev.filter(item => item.id !== id))
    try {
      await fetch(`${API_URL}/api/stock/${id}`, { method: 'DELETE' })
    } catch {
      // Keep the optimistic local delete when the development API is offline.
    }
  }

  const addStock = async (entry: Omit<StockEntry, 'id' | 'lastUpdated'>) => {
    try {
      const response = await fetch(`${API_URL}/api/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })

      if (response.ok) {
        const newEntry = await response.json() as StockEntry
        setStock(prev => [...prev, newEntry])
        return
      }
    } catch {
      // Fall back to local state when the development API is offline.
    }

    const fallbackEntry: StockEntry = {
      ...entry,
      id: Math.random().toString(36).slice(2, 11),
      lastUpdated: new Date().toISOString().split('T')[0],
    }
    setStock(prev => [...prev, fallbackEntry])
  }

  return { stock, isLoading, updateQuantity, deleteStock, addStock }
}
