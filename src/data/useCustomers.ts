import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  gstNumber: string | null
  _count?: {
    sales: number
  }
}

export interface CustomersResponse {
  data: Customer[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function useCustomers(page = 1, limit = 20) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', page, limit],
    queryFn: async () => {
      const response = await api.get(`/customers?page=${page}&limit=${limit}`)
      return response as CustomersResponse
    },
  })

  const addCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      return await api.post('/customers', customerData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
        return await api.put(`/customers/${id}`, data)
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] })
    }
  })

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/customers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    }
  })

  return {
    customers: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    addCustomer: (data: any) => addCustomerMutation.mutateAsync(data),
    updateCustomer: (id: string, data: any) => updateCustomerMutation.mutateAsync({ id, data }),
    deleteCustomer: (id: string) => deleteCustomerMutation.mutateAsync(id)
  }
}

export function useCustomerDetails(id: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null
      const response = await api.get(`/customers/${id}`)
      return response
    },
    enabled: !!id,
  })

  return {
    customer: data,
    isLoading,
    error
  }
}
