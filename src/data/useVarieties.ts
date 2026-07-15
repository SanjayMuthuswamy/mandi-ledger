import { useQuery } from '@tanstack/react-query'
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
  const { data, isLoading, error } = useQuery({
    queryKey: ['varieties'],
    queryFn: async () => {
      const response = await api.get('/rice-varieties')
      return response as RiceVariety[]
    },
  })

  return {
    varieties: data || [],
    isLoading,
    error,
  }
}
