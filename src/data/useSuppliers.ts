import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Supplier {
  id: string
  name: string
  contactName: string | null
  phone: string | null
  email: string | null
  address: string | null
  gstNumber: string | null
  rating: number | null
  _count?: {
    purchases: number
  }
}

export interface SuppliersResponse {
  data: Supplier[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function useSuppliers(page = 1, limit = 20) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['suppliers', page, limit],
    queryFn: async () => {
      const response = await api.get(`/suppliers?page=${page}&limit=${limit}`)
      return response as SuppliersResponse
    },
  })

  const addSupplierMutation = useMutation({
    mutationFn: async (supplierData: any) => {
      return await api.post('/suppliers', supplierData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })

  const updateSupplierMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
        return await api.put(`/suppliers/${id}`, data)
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    }
  })

  return {
    suppliers: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    addSupplier: (data: any) => addSupplierMutation.mutateAsync(data),
    updateSupplier: (id: string, data: any) => updateSupplierMutation.mutateAsync({ id, data })
  }
}

export function useSupplierDetails(id: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      if (!id) return null
      const response = await api.get(`/suppliers/${id}`)
      return response
    },
    enabled: !!id,
  })

  return {
    supplier: data,
    isLoading,
    error
  }
}
