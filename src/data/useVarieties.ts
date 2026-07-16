import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface RiceVariety {
  id: string
  name: string
  code: string
  description: string | null
  basePrice: number
  stocks: {
    quantity: number
  }[]
}

export function useVarieties() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['varieties'],
    queryFn: async () => {
      const response = await api.get('/rice-varieties')
      return response as RiceVariety[]
    },
  })

  const addVarietyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/rice-varieties', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['varieties'] })
    },
  })

  const updateVarietyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      return await api.put(`/rice-varieties/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['varieties'] })
    },
  })

  const deleteVarietyMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/rice-varieties/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['varieties'] })
    },
  })

  return {
    varieties: data || [],
    isLoading,
    error,
    addVariety: (data: any) => addVarietyMutation.mutateAsync(data),
    updateVariety: (id: string, data: any) => updateVarietyMutation.mutateAsync({ id, data }),
    deleteVariety: (id: string) => deleteVarietyMutation.mutateAsync(id)
  }
}
