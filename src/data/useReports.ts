import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useProfitLoss(from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'profit-loss', from, to],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (from) params.append('from', from)
      if (to) params.append('to', to)
      const qs = params.toString()
      return await api.get(`/reports/profit-loss${qs ? `?${qs}` : ''}`)
    },
  })
}

export function useStockMovement(from?: string, to?: string, varietyId?: string) {
  return useQuery({
    queryKey: ['reports', 'stock-movement', from, to, varietyId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (from) params.append('from', from)
      if (to) params.append('to', to)
      if (varietyId) params.append('varietyId', varietyId)
      const qs = params.toString()
      return await api.get(`/reports/stock-movement${qs ? `?${qs}` : ''}`)
    },
  })
}

export function useTopSuppliers(limit = 5, from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'top-suppliers', limit, from, to],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      if (from) params.append('from', from)
      if (to) params.append('to', to)
      const qs = params.toString()
      return await api.get(`/reports/top-suppliers${qs ? `?${qs}` : ''}`)
    },
  })
}

export function useTopCustomers(limit = 5, from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'top-customers', limit, from, to],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      if (from) params.append('from', from)
      if (to) params.append('to', to)
      const qs = params.toString()
      return await api.get(`/reports/top-customers${qs ? `?${qs}` : ''}`)
    },
  })
}
