import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface PurchaseItem {
  id: string
  riceVarietyId: string
  quantity: number
  rate: number
  total: number
  variety: {
    id: string
    name: string
    code: string
  }
}

export interface Purchase {
  id: string
  entryNo: string
  supplierId: string
  purchaseDate: string
  totalAmount: number
  paymentStatus: string
  supplier: {
    id: string
    name: string
  }
  items: PurchaseItem[]
}

export interface PurchasesResponse {
  data: Purchase[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function usePurchases(page = 1, limit = 20) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['purchases', page, limit],
    queryFn: async () => {
      const response = await api.get(`/purchases?page=${page}&limit=${limit}`)
      return response as PurchasesResponse
    },
  })

  const addPurchaseMutation = useMutation({
    mutationFn: async (purchaseData: any) => {
      return await api.post('/purchases', purchaseData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] }) // Stock updates after purchase
      queryClient.invalidateQueries({ queryKey: ['varieties'] }) // Varieties include stock details
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }) 
    },
  })

  const deletePurchaseMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/purchases/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  return {
    purchases: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    addPurchase: (data: any) => addPurchaseMutation.mutateAsync(data),
    deletePurchase: (id: string) => deletePurchaseMutation.mutateAsync(id),
  }
}
