import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'

// GET /api/dashboard/summary
export async function getSummary(_req: Request, res: Response) {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    stockEntries,
    todayPurchases,
    todaySales,
    totalPurchaseValue,
    totalSaleValue,
    lowStockAll,
    pendingPurchases,
    pendingSales,
  ] = await prisma.$transaction([
    // All stock
    prisma.stock.findMany({ include: { variety: true, warehouse: true } }),

    // Today's purchases
    prisma.purchase.findMany({
      where: { purchaseDate: { gte: todayStart }, deletedAt: null },
      include: { items: { include: { variety: true } }, supplier: true },
      orderBy: { purchaseDate: 'desc' },
    }),

    // Today's sales
    prisma.sale.findMany({
      where: { saleDate: { gte: todayStart }, deletedAt: null },
      include: { items: { include: { variety: true } }, customer: true },
      orderBy: { saleDate: 'desc' },
    }),

    // Total purchase value (all time)
    prisma.purchase.aggregate({
      where: { deletedAt: null },
      _sum: { totalAmount: true },
    }),

    // Total sale value (all time)
    prisma.sale.aggregate({
      where: { deletedAt: null },
      _sum: { totalAmount: true },
    }),

    // All stock for low-stock check
    prisma.stock.findMany({ select: { quantity: true, minThreshold: true } }),

    // Pending purchases count
    prisma.purchase.count({
      where: { paymentStatus: 'PENDING', deletedAt: null },
    }),

    // Pending sales count
    prisma.sale.count({
      where: { paymentStatus: 'PENDING', deletedAt: null },
    }),
  ])

  const lowStockCount = lowStockAll.filter(
    (s) => s.quantity < s.minThreshold
  ).length

  // Build today's ledger entries
  const todayLedger = [
    ...todayPurchases.flatMap((p) =>
      p.items.map((item) => ({
        type: 'PURCHASE' as const,
        entryNo: p.entryNo,
        entityName: p.supplier.name,
        varietyName: item.variety.name,
        quantity: item.quantity,
        total: item.total,
        date: p.purchaseDate,
      }))
    ),
    ...todaySales.flatMap((s) =>
      s.items.map((item) => ({
        type: 'SALE' as const,
        entryNo: s.invoiceNo,
        entityName: s.customer.name,
        varietyName: item.variety.name,
        quantity: item.quantity,
        total: item.total,
        date: s.saleDate,
      }))
    ),
  ].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  res.json({
    kpis: {
      totalStockKg: stockEntries.reduce((sum, s) => sum + s.quantity, 0),
      totalPurchaseValue: totalPurchaseValue._sum.totalAmount ?? 0,
      totalSaleValue: totalSaleValue._sum.totalAmount ?? 0,
      netProfit:
        (totalSaleValue._sum.totalAmount ?? 0) -
        (totalPurchaseValue._sum.totalAmount ?? 0),
      lowStockCount,
      pendingPayments: pendingPurchases + pendingSales,
    },
    stock: stockEntries.map((s) => ({
      id: s.id,
      varietyId: s.variety.code,
      varietyName: s.variety.name,
      quantity: s.quantity,
      threshold: s.minThreshold,
      max: s.maxCapacity ?? s.minThreshold * 5,
      price: s.variety.basePrice,
      lastUpdated: s.updatedAt.toISOString().split('T')[0],
    })),
    todayLedger,
  })
}

