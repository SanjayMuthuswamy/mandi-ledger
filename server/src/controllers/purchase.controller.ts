import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import {
  CreatePurchaseSchema,
  UpdatePurchaseStatusSchema,
  PaginationSchema,
} from '../lib/schemas.js'

// Auto-increment helper: generate next entry number (P-XXXX)
async function nextEntryNo(): Promise<string> {
  const latest = await prisma.purchase.findFirst({
    orderBy: { entryNo: 'desc' },
    select: { entryNo: true },
  })
  const num = latest
    ? Number(latest.entryNo.replace(/\D/g, '')) + 1
    : 1001
  return `P-${num}`
}

// ── GET /api/purchases ────────────────────────────────────────────────────────
export async function listPurchases(req: Request, res: Response) {
  const { page, limit } = PaginationSchema.parse(req.query)
  const skip = (page - 1) * limit

  // Optional filters
  const supplierId = req.query.supplierId as string | undefined
  const from = req.query.from as string | undefined
  const to = req.query.to as string | undefined

  const where = {
    deletedAt: null,
    ...(supplierId ? { supplierId } : {}),
    ...(from || to
      ? {
          purchaseDate: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  }

  const [total, purchases] = await prisma.$transaction([
    prisma.purchase.count({ where }),
    prisma.purchase.findMany({
      where,
      skip,
      take: limit,
      orderBy: { purchaseDate: 'desc' },
      include: {
        supplier: { select: { id: true, name: true } },
        items: { include: { variety: { select: { id: true, name: true, code: true } } } },
      },
    }),
  ])

  res.json({
    data: purchases,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  })
}

// ── POST /api/purchases ───────────────────────────────────────────────────────
export async function createPurchase(req: Request, res: Response) {
  const body = CreatePurchaseSchema.parse(req.body)
  const totalAmount = body.items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const entryNo = await nextEntryNo()

  // Use a transaction: create purchase + upsert stock for each item
  const purchase = await prisma.$transaction(async (tx) => {
    const created = await tx.purchase.create({
      data: {
        entryNo,
        supplierId: body.supplierId,
        purchaseDate: new Date(body.purchaseDate),
        totalAmount,
        paymentStatus: body.paymentStatus,
        invoiceDoc: body.invoiceDoc,
        createdBy: req.user?.sub,
        items: {
          create: body.items.map((item) => ({
            riceVarietyId: item.riceVarietyId,
            quantity: item.quantity,
            kgPerBag: item.kgPerBag ?? 26,
            rate: item.rate,
            total: item.quantity * item.rate,
          })),
        },
      },
      include: {
        supplier: true,
        items: { include: { variety: true } },
      },
    })

    // Update stock for each purchased item (default warehouse strategy: first warehouse)
    const warehouse = await tx.warehouse.findFirst()
    if (!warehouse) {
      throw new Error('No warehouse configured. Please add a warehouse first.')
    }

    for (const item of body.items) {
      const incrementKg = item.quantity * (item.kgPerBag ?? 26)
      await tx.stock.upsert({
        where: {
          warehouseId_riceVarietyId: {
            warehouseId: warehouse.id,
            riceVarietyId: item.riceVarietyId,
          },
        },
        update: { quantity: { increment: incrementKg } },
        create: {
          warehouseId: warehouse.id,
          riceVarietyId: item.riceVarietyId,
          quantity: incrementKg,
          minThreshold: 1000,
        },
      })
    }

    return created
  })

  res.status(201).json(purchase)
}

// ── GET /api/purchases/:id ────────────────────────────────────────────────────
export async function getPurchase(req: Request, res: Response) {
  const purchase = await prisma.purchase.findFirstOrThrow({
    where: { id: String(req.params.id), deletedAt: null },
    include: {
      supplier: true,
      items: { include: { variety: true } },
    },
  })
  res.json(purchase)
}

// ── PATCH /api/purchases/:id/status ──────────────────────────────────────────
export async function updatePurchaseStatus(req: Request, res: Response) {
  const { paymentStatus } = UpdatePurchaseStatusSchema.parse(req.body)
  const purchase = await prisma.purchase.update({
    where: { id: String(req.params.id) },
    data: { paymentStatus },
  })
  res.json(purchase)
}

// ── DELETE /api/purchases/:id ─────────────────────────────────────────────────
export async function deletePurchase(req: Request, res: Response) {
  await prisma.purchase.update({
    where: { id: String(req.params.id) },
    data: { deletedAt: new Date() },
  })
  res.status(204).send()
}
