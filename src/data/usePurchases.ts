import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface PurchaseItem {
  id: string
  riceVarietyId: string
  quantity: number
  kgPerBag?: number
  rate: number
  total: number
  variety: {
    id: string
    name: string
    code: string
  }
}

export interface Payment {
  id: string
  amount: number
  paymentMethod: string
  paymentDate: string
  notes?: string | null
}

export interface Purchase {
  id: string
  entryNo: string
  supplierId: string
  purchaseDate: string
  totalAmount: number
  paymentStatus: string
  amountPaid?: number
  paymentMethod?: string
  paymentDate?: string | null
  supplier: {
    id: string
    name: string
    phone?: string | null
    address?: string | null
    gstNumber?: string | null
  }
  items: PurchaseItem[]
  payments?: Payment[]
  createdAt?: string
  updatedAt?: string
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
      queryClient.invalidateQueries({ queryKey: ['stock'] }) // stock reverts after delete
      queryClient.invalidateQueries({ queryKey: ['varieties'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const updatePurchaseStatusMutation = useMutation({
    mutationFn: async ({ id, status, amountPaid, paymentMethod, paymentDate }: { id: string, status: string, amountPaid?: number, paymentMethod?: string, paymentDate?: string | null }) => {
      return await api.patch(`/purchases/${id}/status`, { paymentStatus: status, amountPaid, paymentMethod, paymentDate })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['purchase', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const updatePurchaseMutation = useMutation({
    mutationFn: async ({ id, purchaseData }: { id: string, purchaseData: any }) => {
      return await api.put(`/purchases/${id}`, purchaseData)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['purchase', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      queryClient.invalidateQueries({ queryKey: ['varieties'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const addPaymentMutation = useMutation({
    mutationFn: async ({ purchaseId, payment }: { purchaseId: string; payment: any }) => {
      return await api.post(`/purchases/${purchaseId}/payments`, payment)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['purchase', variables.purchaseId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })

  const deletePaymentMutation = useMutation({
    mutationFn: async ({ purchaseId, paymentId }: { purchaseId: string; paymentId: string }) => {
      return await api.delete(`/purchases/${purchaseId}/payments/${paymentId}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['purchase', variables.purchaseId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })

  return {
    purchases: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    addPurchase: (data: any) => addPurchaseMutation.mutateAsync(data),
    deletePurchase: (id: string) => deletePurchaseMutation.mutateAsync(id),
    updateStatus: (id: string, status: string, amountPaid?: number, paymentMethod?: string, paymentDate?: string | null) => 
      updatePurchaseStatusMutation.mutateAsync({ id, status, amountPaid, paymentMethod, paymentDate }),
    updatePurchase: (id: string, purchaseData: any) => updatePurchaseMutation.mutateAsync({ id, purchaseData }),
    addPayment: (purchaseId: string, payment: any) => addPaymentMutation.mutateAsync({ purchaseId, payment }),
    deletePayment: (purchaseId: string, paymentId: string) => deletePaymentMutation.mutateAsync({ purchaseId, paymentId }),
  }
}

export function usePurchaseDetails(id: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['purchase', id],
    queryFn: async () => {
      if (!id) return null
      const response = await api.get(`/purchases/${id}`)
      return response as Purchase
    },
    enabled: !!id,
  })

  return { purchase: data, isLoading, error }
}
