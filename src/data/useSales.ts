import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface SaleItem {
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

export interface Sale {
  id: string
  invoiceNo: string
  customerId: string
  saleDate: string
  totalAmount: number
  paymentStatus: string
  customer: {
    id: string
    name: string
  }
  items: SaleItem[]
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

  return {
    sales: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    addSale: (data: any) => addSaleMutation.mutateAsync(data),
    deleteSale: (id: string) => deleteSaleMutation.mutateAsync(id)
  }
}
