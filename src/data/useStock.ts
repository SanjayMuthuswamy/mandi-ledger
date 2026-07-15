import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

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

export function useStock() {
  const queryClient = useQueryClient()

  const { data: stock = [], isLoading, error } = useQuery({
    queryKey: ['stock'],
    queryFn: async () => {
      const data = await api.get('/stock')
      return data as StockEntry[]
    },
  })

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string, quantity: number }) => {
      return await api.patch(`/stock/${id}`, { quantity })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    },
  })

  const deleteStockMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/stock/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    },
  })

  const addStockMutation = useMutation({
    mutationFn: async (entry: Omit<StockEntry, 'id' | 'lastUpdated'>) => {
      return await api.post('/stock', entry)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    },
  })

  const updateQuantity = async (id: string, newQuantity: number) => {
     await updateQuantityMutation.mutateAsync({ id, quantity: newQuantity })
  }
  
  const deleteStock = async (id: string) => {
      await deleteStockMutation.mutateAsync(id)
  }

  const addStock = async (entry: Omit<StockEntry, 'id' | 'lastUpdated'>) => {
      await addStockMutation.mutateAsync(entry)
  }

  return { 
    stock, 
    isLoading, 
    error,
    updateQuantity, 
    deleteStock, 
    addStock 
  }
}
