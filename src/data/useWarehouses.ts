import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Warehouse {
  id: string
  name: string
  location: string | null
  capacity: number | null
}

export function useWarehouses() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await api.get('/warehouses')
      return response as Warehouse[]
    },
  })

  const addWarehouseMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/warehouses', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    },
  })

  const updateWarehouseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      return await api.put(`/warehouses/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    },
  })

  const deleteWarehouseMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/warehouses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    },
  })

  return {
    warehouses: data || [],
    isLoading,
    error,
    addWarehouse: (data: any) => addWarehouseMutation.mutateAsync(data),
    updateWarehouse: (id: string, data: any) => updateWarehouseMutation.mutateAsync({ id, data }),
    deleteWarehouse: (id: string) => deleteWarehouseMutation.mutateAsync(id)
  }
}
