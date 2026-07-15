import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { StockEntry } from './useStock'

export interface LedgerEntry {
  type: 'PURCHASE' | 'SALE'
  entryNo: string
  entityName: string
  varietyName: string
  quantity: number
  total: number
  date: string
}

export interface DashboardSummary {
  kpis: {
    totalStockKg: number
    totalPurchaseValue: number
    totalSaleValue: number
    netProfit: number
    lowStockCount: number
    pendingPayments: number
  }
  stock: StockEntry[]
  todayLedger: LedgerEntry[]
}

export function useDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard/summary')
      return response as DashboardSummary
    },
    refetchInterval: 60000, // Refetch every minute to keep dashboard fresh
  })

  return {
    summary: data,
    isLoading,
    error,
  }
}
