import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import {
  CreateSaleSchema,
  UpdateSaleStatusSchema,
  PaginationSchema,
} from '../lib/schemas.js'

// Auto-increment invoice number (S-XXXX)
async function nextInvoiceNo(): Promise<string> {
  const latest = await prisma.sale.findFirst({
    orderBy: { invoiceNo: 'desc' },
    select: { invoiceNo: true },
  })
  const num = latest ? Number(latest.invoiceNo.replace(/\D/g, '')) + 1 : 2001
  return `S-${num}`
}

// ── GET /api/sales ────────────────────────────────────────────────────────────
export async function listSales(req: Request, res: Response) {
  const { page, limit } = PaginationSchema.parse(req.query)
  const skip = (page - 1) * limit

  const customerId = req.query.customerId as string | undefined
  const from = req.query.from as string | undefined
  const to = req.query.to as string | undefined

  const where = {
    deletedAt: null,
    ...(customerId ? { customerId } : {}),
    ...(from || to
      ? {
          saleDate: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  }

  const [total, sales] = await prisma.$transaction([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { saleDate: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
        items: { include: { variety: { select: { id: true, name: true, code: true } } } },
      },
    }),
  ])

  res.json({
    data: sales,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  })
}

// ── POST /api/sales ───────────────────────────────────────────────────────────
export async function createSale(req: Request, res: Response) {
  const body = CreateSaleSchema.parse(req.body)
  const totalAmount = body.items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const invoiceNo = await nextInvoiceNo()

  const sale = await prisma.$transaction(async (tx) => {
    // Check stock availability for each item and deduct atomically
    const warehouse = await tx.warehouse.findFirst()
    if (!warehouse) {
      throw new Error('No warehouse configured. Please add a warehouse first.')
    }

    for (const item of body.items) {
      const stockEntry = await tx.stock.findUnique({
        where: {
          warehouseId_riceVarietyId: {
            warehouseId: warehouse.id,
            riceVarietyId: item.riceVarietyId,
          },
        },
        include: { variety: true },
      })

      const requestedKg = item.quantity * (item.kgPerBag ?? 26)
      if (!stockEntry || stockEntry.quantity < requestedKg) {
        const available = stockEntry?.quantity ?? 0
        const varietyName = stockEntry?.variety.name ?? item.riceVarietyId
        throw Object.assign(
          new Error(`Insufficient stock for ${varietyName}. Available: ${available} kg, Requested: ${requestedKg} kg`),
          { statusCode: 422 }
        )
      }

      await tx.stock.update({
        where: {
          warehouseId_riceVarietyId: {
            warehouseId: warehouse.id,
            riceVarietyId: item.riceVarietyId,
          },
        },
        data: { quantity: { decrement: requestedKg } },
      })
    }

    const finalAmountPaid = body.paymentStatus === 'PAID' ? totalAmount : (body.amountPaid ?? 0)

    return tx.sale.create({
      data: {
        invoiceNo,
        customerId: body.customerId,
        saleDate: new Date(body.saleDate),
        totalAmount,
        paymentStatus: body.paymentStatus,
        amountPaid: finalAmountPaid,
        paymentMethod: body.paymentMethod,
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
        customer: true,
        items: { include: { variety: true } },
      },
    })
  })

  res.status(201).json(sale)
}

// ── GET /api/sales/:id ────────────────────────────────────────────────────────
export async function getSale(req: Request, res: Response) {
  const sale = await prisma.sale.findFirstOrThrow({
    where: { id: String(req.params.id), deletedAt: null },
    include: {
      customer: true,
      items: { include: { variety: true } },
    },
  })
  res.json(sale)
}

// ── PATCH /api/sales/:id/status ───────────────────────────────────────────────
export async function updateSaleStatus(req: Request, res: Response) {
  const { paymentStatus, amountPaid, paymentMethod } = UpdateSaleStatusSchema.parse(req.body)
  const existing = await prisma.sale.findUniqueOrThrow({ where: { id: String(req.params.id) } })

  let finalAmountPaid = amountPaid
  if (paymentStatus === 'PAID' && amountPaid === undefined) {
    finalAmountPaid = existing.totalAmount
  } else if (paymentStatus === 'PENDING' && amountPaid === undefined) {
    finalAmountPaid = 0
  }

  const sale = await prisma.sale.update({
    where: { id: String(req.params.id) },
    data: { 
      paymentStatus,
      ...(finalAmountPaid !== undefined ? { amountPaid: finalAmountPaid } : {}),
      ...(paymentMethod !== undefined ? { paymentMethod } : {}),
    },
  })
  res.json(sale)
}

// ── DELETE /api/sales/:id ─────────────────────────────────────────────────────
export async function deleteSale(req: Request, res: Response) {
  if (req.user?.roleName !== 'ADMIN') {
    res.status(403).json({ error: 'Access Denied: Only Administrators can delete sales records.' })
    return
  }

  const saleId = String(req.params.id)

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Get the sale and its items
      const sale = await tx.sale.findFirstOrThrow({
        where: { id: saleId, deletedAt: null },
        include: { items: true },
      })

      // 2. Find warehouse
      const warehouse = await tx.warehouse.findFirst()
      if (!warehouse) {
        throw new Error('No warehouse configured. Cannot revert stock.')
      }

      // 3. Revert stock (increment stock since it was a sale)
      for (const item of sale.items) {
        const revertKg = item.quantity * item.kgPerBag
        await tx.stock.update({
          where: {
            warehouseId_riceVarietyId: {
              warehouseId: warehouse.id,
              riceVarietyId: item.riceVarietyId,
            },
          },
          data: { quantity: { increment: revertKg } },
        })
      }

      // 4. Create audit log entry
      await tx.auditLog.create({
        data: {
          userId: req.user?.sub,
          action: 'SALE_DELETED',
          entityType: 'Sale',
          entityId: saleId,
          oldValue: JSON.parse(JSON.stringify(sale)),
          newValue: { deletedAt: new Date().toISOString(), status: 'REVERTED' },
        },
      })

      // 5. Soft delete the sale
      await tx.sale.update({
        where: { id: saleId },
        data: { deletedAt: new Date() },
      })
    })

    res.status(204).send()
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete sale and revert stock.' })
  }
}

// ── PUT /api/sales/:id ────────────────────────────────────────────────────────
export async function updateSale(req: Request, res: Response) {
  if (req.user?.roleName !== 'ADMIN') {
    res.status(403).json({ error: 'Access Denied: Only Administrators can edit sales records.' })
    return
  }

  const saleId = String(req.params.id)
  const body = CreateSaleSchema.parse(req.body)
  const totalAmount = body.items.reduce((s, i) => s + i.quantity * i.rate, 0)

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Get the existing sale with items
      const existing = await tx.sale.findFirstOrThrow({
        where: { id: saleId, deletedAt: null },
        include: { items: true },
      })

      // 2. Find warehouse
      const warehouse = await tx.warehouse.findFirst()
      if (!warehouse) {
        throw new Error('No warehouse configured. Cannot update stock.')
      }

      // 3. Revert old stock (increment since it was a sale)
      for (const item of existing.items) {
        const revertKg = item.quantity * item.kgPerBag
        await tx.stock.update({
          where: {
            warehouseId_riceVarietyId: {
              warehouseId: warehouse.id,
              riceVarietyId: item.riceVarietyId,
            },
          },
          data: { quantity: { increment: revertKg } },
        })
      }

      // 4. Validate and deduct new stock
      for (const item of body.items) {
        const stockEntry = await tx.stock.findUnique({
          where: {
            warehouseId_riceVarietyId: {
              warehouseId: warehouse.id,
              riceVarietyId: item.riceVarietyId,
            },
          },
          include: { variety: true },
        })

        const requestedKg = item.quantity * (item.kgPerBag ?? 26)
        if (!stockEntry || stockEntry.quantity < requestedKg) {
          const available = stockEntry?.quantity ?? 0
          const varietyName = stockEntry?.variety.name ?? item.riceVarietyId
          throw Object.assign(
            new Error(`Insufficient stock for ${varietyName}. Available: ${available} kg, Requested: ${requestedKg} kg`),
            { statusCode: 422 }
          )
        }

        await tx.stock.update({
          where: {
            warehouseId_riceVarietyId: {
              warehouseId: warehouse.id,
              riceVarietyId: item.riceVarietyId,
            },
          },
          data: { quantity: { decrement: requestedKg } },
        })
      }

      // 5. Delete old items
      await tx.saleItem.deleteMany({
        where: { saleId },
      })

      // 6. Update sale fields
      const finalAmountPaid = body.paymentStatus === 'PAID' ? totalAmount : (body.amountPaid ?? 0)

      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          customerId: body.customerId,
          saleDate: new Date(body.saleDate),
          totalAmount,
          paymentStatus: body.paymentStatus,
          amountPaid: finalAmountPaid,
          paymentMethod: body.paymentMethod,
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
          customer: true,
          items: { include: { variety: true } },
        },
      })

      // 7. Write audit log
      await tx.auditLog.create({
        data: {
          userId: req.user?.sub,
          action: 'SALE_UPDATED',
          entityType: 'Sale',
          entityId: saleId,
          oldValue: JSON.parse(JSON.stringify(existing)),
          newValue: JSON.parse(JSON.stringify(updatedSale)),
        },
      })

      return updatedSale
    })

    res.json(updated)
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to update sale.' })
  }
}
