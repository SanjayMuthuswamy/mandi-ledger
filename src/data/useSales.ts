import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface SaleItem {
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

export interface Sale {
  id: string
  invoiceNo: string
  customerId: string
  saleDate: string
  totalAmount: number
  paymentStatus: string
  amountPaid?: number
  paymentMethod?: string | null
  customer: {
    id: string
    name: string
    phone?: string | null
    address?: string | null
    gstNumber?: string | null
  }
  items: SaleItem[]
  payments?: Payment[]
  createdAt?: string
  updatedAt?: string
}

export interface SalesResponse {
  data: Sale[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function useSales(page = 1, limit = 20) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['sales', page, limit],
    queryFn: async () => {
      const response = await api.get(`/sales?page=${page}&limit=${limit}`)
      return response as SalesResponse
    },
  })

  const addSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      return await api.post('/sales', saleData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] }) // Stock updates after sale
      queryClient.invalidateQueries({ queryKey: ['varieties'] }) // Varieties include stock details
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }) 
    },
  })

  const deleteSaleMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/sales/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const updateSaleStatusMutation = useMutation({
    mutationFn: async ({ id, status, amountPaid, paymentMethod }: { id: string, status: string, amountPaid?: number, paymentMethod?: string | null }) => {
      return await api.patch(`/sales/${id}/status`, { 
        paymentStatus: status,
        ...(amountPaid !== undefined ? { amountPaid } : {}),
        ...(paymentMethod !== undefined ? { paymentMethod } : {})
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['sale', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const updateSaleMutation = useMutation({
    mutationFn: async ({ id, saleData }: { id: string, saleData: any }) => {
      return await api.put(`/sales/${id}`, saleData)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['sale', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      queryClient.invalidateQueries({ queryKey: ['varieties'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const addPaymentMutation = useMutation({
    mutationFn: async ({ saleId, payment }: { saleId: string; payment: any }) => {
      return await api.post(`/sales/${saleId}/payments`, payment)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['sale', variables.saleId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })

  const deletePaymentMutation = useMutation({
    mutationFn: async ({ saleId, paymentId }: { saleId: string; paymentId: string }) => {
      return await api.delete(`/sales/${saleId}/payments/${paymentId}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['sale', variables.saleId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })

  return {
    sales: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    addSale: (data: any) => addSaleMutation.mutateAsync(data),
    deleteSale: (id: string) => deleteSaleMutation.mutateAsync(id),
    updateStatus: (id: string, status: string, amountPaid?: number, paymentMethod?: string | null) => 
      updateSaleStatusMutation.mutateAsync({ id, status, amountPaid, paymentMethod }),
    updateSale: (id: string, saleData: any) => updateSaleMutation.mutateAsync({ id, saleData }),
    addPayment: (saleId: string, payment: any) => addPaymentMutation.mutateAsync({ saleId, payment }),
    deletePayment: (saleId: string, paymentId: string) => deletePaymentMutation.mutateAsync({ saleId, paymentId }),
  }
}

export function useSaleDetails(id: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sale', id],
    queryFn: async () => {
      if (!id) return null
      const response = await api.get(`/sales/${id}`)
      return response as Sale
    },
    enabled: !!id,
  })

  return { sale: data, isLoading, error }
}
