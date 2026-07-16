import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { z } from 'zod'

const DateRangeSchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
})

function buildDateRange(from?: string, to?: string) {
  if (!from && !to) return undefined
  return {
    gte: from ? new Date(from) : undefined,
    lte: to ? new Date(to + 'T23:59:59') : undefined,
  }
}

// ── GET /api/reports/profit-loss ──────────────────────────────────────────────
export async function profitLoss(req: Request, res: Response) {
  const { from, to } = DateRangeSchema.parse(req.query)
  const dateRange = buildDateRange(from, to)

  const [purchaseAgg, saleAgg, purchasesByVariety, salesByVariety] =
    await prisma.$transaction([
      prisma.purchase.aggregate({
        where: { deletedAt: null, ...(dateRange ? { purchaseDate: dateRange } : {}) },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { deletedAt: null, ...(dateRange ? { saleDate: dateRange } : {}) },
        _sum: { totalAmount: true },
        _count: true,
      }),
      // Group purchase cost by variety via raw aggregation on items
      prisma.purchaseItem.groupBy({
        by: ['riceVarietyId'],
        _sum: { total: true, quantity: true },
        where: {
          purchase: {
            deletedAt: null,
            ...(dateRange ? { purchaseDate: dateRange } : {}),
          },
        },
      }),
      prisma.saleItem.groupBy({
        by: ['riceVarietyId'],
        _sum: { total: true, quantity: true },
        where: {
          sale: {
            deletedAt: null,
            ...(dateRange ? { saleDate: dateRange } : {}),
          },
        },
      }),
    ])

  // Fetch variety names for the grouped items
  const varietyIds = [
    ...new Set([
      ...purchasesByVariety.map((r) => r.riceVarietyId),
      ...salesByVariety.map((r) => r.riceVarietyId),
    ]),
  ]
  const varieties = await prisma.riceVariety.findMany({
    where: { id: { in: varietyIds } },
    select: { id: true, name: true, code: true },
  })
  const varietyMap = new Map<string, { id: string; name: string; code: string }>(varieties.map((v) => [v.id, v]))

  const byVariety = varietyIds.map((vid) => {
    const variety = varietyMap.get(vid)
    const purchase = purchasesByVariety.find((r) => r.riceVarietyId === vid)
    const sale = salesByVariety.find((r) => r.riceVarietyId === vid)
    const costAmount = purchase?._sum.total ?? 0
    const revenueAmount = sale?._sum.total ?? 0
    return {
      varietyId: vid,
      varietyName: variety?.name ?? 'Unknown',
      varietyCode: variety?.code ?? '',
      quantityPurchased: purchase?._sum.quantity ?? 0,
      quantitySold: sale?._sum.quantity ?? 0,
      costAmount,
      revenueAmount,
      profit: revenueAmount - costAmount,
      margin:
        revenueAmount > 0
          ? (((revenueAmount - costAmount) / revenueAmount) * 100).toFixed(2)
          : '0.00',
    }
  })

  const totalCost = purchaseAgg._sum.totalAmount ?? 0
  const totalRevenue = saleAgg._sum.totalAmount ?? 0

  res.json({
    summary: {
      totalCost,
      totalRevenue,
      grossProfit: totalRevenue - totalCost,
      margin:
        totalRevenue > 0
          ? (((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(2)
          : '0.00',
      totalPurchases: purchaseAgg._count,
      totalSales: saleAgg._count,
    },
    byVariety,
    period: { from, to },
  })
}

// ── GET /api/reports/stock-movement ──────────────────────────────────────────
export async function stockMovement(req: Request, res: Response) {
  const schema = DateRangeSchema.extend({
    varietyId: z.string().optional(),
  })
  const { from, to, varietyId } = schema.parse(req.query)
  const dateRange = buildDateRange(from, to)

  const [purchases, sales] = await prisma.$transaction([
    prisma.purchaseItem.findMany({
      where: {
        ...(varietyId ? { riceVarietyId: varietyId } : {}),
        purchase: {
          deletedAt: null,
          ...(dateRange ? { purchaseDate: dateRange } : {}),
        },
      },
      include: {
        variety: { select: { name: true, code: true } },
        purchase: { select: { purchaseDate: true, entryNo: true, supplier: { select: { name: true } } } },
      },
      orderBy: { purchase: { purchaseDate: 'asc' } },
    }),
    prisma.saleItem.findMany({
      where: {
        ...(varietyId ? { riceVarietyId: varietyId } : {}),
        sale: {
          deletedAt: null,
          ...(dateRange ? { saleDate: dateRange } : {}),
        },
      },
      include: {
        variety: { select: { name: true, code: true } },
        sale: { select: { saleDate: true, invoiceNo: true, customer: { select: { name: true } } } },
      },
      orderBy: { sale: { saleDate: 'asc' } },
    }),
  ])

  const movements = [
    ...purchases.map((p) => ({
      type: 'IN' as const,
      date: p.purchase.purchaseDate,
      entryNo: p.purchase.entryNo,
      entityName: p.purchase.supplier.name,
      varietyName: p.variety.name,
      varietyCode: p.variety.code,
      quantity: p.quantity,
      rate: p.rate,
      total: p.total,
    })),
    ...sales.map((s) => ({
      type: 'OUT' as const,
      date: s.sale.saleDate,
      entryNo: s.sale.invoiceNo,
      entityName: s.sale.customer.name,
      varietyName: s.variety.name,
      varietyCode: s.variety.code,
      quantity: s.quantity,
      rate: s.rate,
      total: s.total,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  res.json({ movements, period: { from, to } })
}

// ── GET /api/reports/top-suppliers ───────────────────────────────────────────
export async function topSuppliers(req: Request, res: Response) {
  const limit = Math.min(Number(req.query.limit ?? 5), 20)
  const { from, to } = DateRangeSchema.parse(req.query)
  const dateRange = buildDateRange(from, to)

  const grouped = await prisma.purchaseItem.groupBy({
    by: ['purchaseId'],
    _sum: { quantity: true, total: true },
    where: {
      purchase: {
        deletedAt: null,
        ...(dateRange ? { purchaseDate: dateRange } : {}),
      },
    },
  })

  // Aggregate by supplier via JS (Prisma doesn't allow nested groupBy across relations)
  const purchaseIds = grouped.map((g) => g.purchaseId)
  const purchasesWithSupplier = await prisma.purchase.findMany({
    where: { id: { in: purchaseIds } },
    select: { id: true, supplier: { select: { id: true, name: true } } },
  })
  const purchaseToSupplier = new Map<string, { id: string; name: string }>(
    purchasesWithSupplier.map((p) => [p.id, p.supplier])
  )

  const supplierMap = new Map<
    string,
    { name: string; totalQuantity: number; totalValue: number; count: number }
  >()
  for (const g of grouped) {
    const supplier = purchaseToSupplier.get(g.purchaseId)
    if (!supplier) continue
    const existing = supplierMap.get(supplier.id) ?? {
      name: supplier.name,
      totalQuantity: 0,
      totalValue: 0,
      count: 0,
    }
    existing.totalQuantity += g._sum.quantity ?? 0
    existing.totalValue += g._sum.total ?? 0
    existing.count += 1
    supplierMap.set(supplier.id, existing)
  }

  const top = [...supplierMap.entries()]
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, limit)

  res.json(top)
}

// ── GET /api/reports/top-customers ───────────────────────────────────────────
export async function topCustomers(req: Request, res: Response) {
  const limit = Math.min(Number(req.query.limit ?? 5), 20)
  const { from, to } = DateRangeSchema.parse(req.query)
  const dateRange = buildDateRange(from, to)

  const grouped = await prisma.saleItem.groupBy({
    by: ['saleId'],
    _sum: { quantity: true, total: true },
    where: {
      sale: {
        deletedAt: null,
        ...(dateRange ? { saleDate: dateRange } : {}),
      },
    },
  })

  const saleIds = grouped.map((g) => g.saleId)
  const salesWithCustomer = await prisma.sale.findMany({
    where: { id: { in: saleIds } },
    select: { id: true, customer: { select: { id: true, name: true } } },
  })
  const saleToCustomer = new Map<string, { id: string; name: string }>(salesWithCustomer.map((s) => [s.id, s.customer]))

  const customerMap = new Map<
    string,
    { name: string; totalQuantity: number; totalValue: number; count: number }
  >()
  for (const g of grouped) {
    const customer = saleToCustomer.get(g.saleId)
    if (!customer) continue
    const existing = customerMap.get(customer.id) ?? {
      name: customer.name,
      totalQuantity: 0,
      totalValue: 0,
      count: 0,
    }
    existing.totalQuantity += g._sum.quantity ?? 0
    existing.totalValue += g._sum.total ?? 0
    existing.count += 1
    customerMap.set(customer.id, existing)
  }

  const top = [...customerMap.entries()]
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, limit)

  res.json(top)
}
