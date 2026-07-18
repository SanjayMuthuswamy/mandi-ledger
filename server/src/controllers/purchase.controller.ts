import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { z } from 'zod'
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
    const finalAmountPaid = body.paymentStatus === 'PAID' ? totalAmount : (body.amountPaid ?? 0)
    const finalPaymentDate = body.paymentDate 
      ? new Date(body.paymentDate) 
      : (body.paymentStatus === 'PAID' || body.paymentStatus === 'PARTIAL' ? new Date() : null)

    const created = await tx.purchase.create({
      data: {
        entryNo,
        supplierId: body.supplierId,
        purchaseDate: new Date(body.purchaseDate),
        totalAmount,
        paymentStatus: body.paymentStatus,
        amountPaid: finalAmountPaid,
        paymentMethod: body.paymentMethod,
        paymentDate: finalPaymentDate,
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
        ...(finalAmountPaid > 0 ? {
          payments: {
            create: {
              amount: finalAmountPaid,
              paymentMethod: body.paymentMethod || 'CASH',
              paymentDate: finalPaymentDate || new Date(),
              notes: 'Initial payment logged during purchase creation'
            }
          }
        } : {})
      },
      include: {
        supplier: true,
        items: { include: { variety: true } },
        payments: true,
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
      payments: { orderBy: { paymentDate: 'asc' } },
    },
  })
  res.json(purchase)
}

// ── PATCH /api/purchases/:id/status ──────────────────────────────────────────
export async function updatePurchaseStatus(req: Request, res: Response) {
  const { paymentStatus, amountPaid, paymentMethod, paymentDate } = UpdatePurchaseStatusSchema.parse(req.body)
  const existing = await prisma.purchase.findUniqueOrThrow({ where: { id: String(req.params.id) } })

  let finalAmountPaid = amountPaid
  if (paymentStatus === 'PAID' && amountPaid === undefined) {
    finalAmountPaid = existing.totalAmount
  } else if (paymentStatus === 'PENDING' && amountPaid === undefined) {
    finalAmountPaid = 0
  }

  let finalPaymentDate = paymentDate
  if (paymentDate === undefined) {
    if (paymentStatus === 'PAID') {
      finalPaymentDate = new Date().toISOString()
    } else if (paymentStatus === 'PENDING') {
      finalPaymentDate = null
    }
  }

  const purchase = await prisma.purchase.update({
    where: { id: String(req.params.id) },
    data: { 
      paymentStatus,
      ...(finalAmountPaid !== undefined ? { amountPaid: finalAmountPaid } : {}),
      ...(paymentMethod !== undefined ? { paymentMethod } : {}),
      ...(finalPaymentDate !== undefined ? { paymentDate: finalPaymentDate ? new Date(finalPaymentDate) : null } : {}),
    },
  })
  res.json(purchase)
}

// ── DELETE /api/purchases/:id ─────────────────────────────────────────────────
export async function deletePurchase(req: Request, res: Response) {
  if (req.user?.roleName !== 'ADMIN') {
    res.status(403).json({ error: 'Access Denied: Only Administrators can delete purchase records.' })
    return
  }

  const purchaseId = String(req.params.id)

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Get the purchase and its items
      const purchase = await tx.purchase.findFirstOrThrow({
        where: { id: purchaseId, deletedAt: null },
        include: { items: true },
      })

      // 2. Find warehouse
      const warehouse = await tx.warehouse.findFirst()
      if (!warehouse) {
        throw new Error('No warehouse configured. Cannot revert stock.')
      }

      // 3. Revert stock (decrement stock since it was a purchase)
      for (const item of purchase.items) {
        const revertKg = item.quantity * item.kgPerBag
        const updatedStock = await tx.stock.update({
          where: {
            warehouseId_riceVarietyId: {
              warehouseId: warehouse.id,
              riceVarietyId: item.riceVarietyId,
            },
          },
          data: { quantity: { decrement: revertKg } },
        })

        if (updatedStock.quantity < 0) {
          const varietyName = await tx.riceVariety.findUnique({ where: { id: item.riceVarietyId } }).then(v => v?.name || 'variety')
          throw new Error(`Insufficient stock of ${varietyName} in warehouse to delete this purchase. Current stock is ${(updatedStock.quantity + revertKg).toLocaleString()} kg, but need to revert ${revertKg.toLocaleString()} kg.`)
        }
      }

      // 4. Create audit log entry
      await tx.auditLog.create({
        data: {
          userId: req.user?.sub,
          action: 'PURCHASE_DELETED',
          entityType: 'Purchase',
          entityId: purchaseId,
          oldValue: JSON.parse(JSON.stringify(purchase)),
          newValue: { deletedAt: new Date().toISOString(), status: 'REVERTED' },
        },
      })

      // 5. Soft delete the purchase
      await tx.purchase.update({
        where: { id: purchaseId },
        data: { deletedAt: new Date() },
      })
    })

    res.status(204).send()
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete purchase and revert stock.' })
  }
}

// ── PUT /api/purchases/:id ─────────────────────────────────────────────────────
export async function updatePurchase(req: Request, res: Response) {
  if (req.user?.roleName !== 'ADMIN') {
    res.status(403).json({ error: 'Access Denied: Only Administrators can edit purchase records.' })
    return
  }

  const purchaseId = String(req.params.id)
  const body = CreatePurchaseSchema.parse(req.body)
  const totalAmount = body.items.reduce((s, i) => s + i.quantity * i.rate, 0)

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Get existing purchase
      const existing = await tx.purchase.findFirstOrThrow({
        where: { id: purchaseId, deletedAt: null },
        include: { items: true },
      })

      // 2. Find warehouse
      const warehouse = await tx.warehouse.findFirst()
      if (!warehouse) {
        throw new Error('No warehouse configured. Cannot update stock.')
      }

      // 3. Revert old stock (decrement stock since it was a purchase)
      const varietyIdsToCheck = new Set<string>()
      for (const item of existing.items) {
        varietyIdsToCheck.add(item.riceVarietyId)
        const revertKg = item.quantity * item.kgPerBag
        await tx.stock.update({
          where: {
            warehouseId_riceVarietyId: {
              warehouseId: warehouse.id,
              riceVarietyId: item.riceVarietyId,
            },
          },
          data: { quantity: { decrement: revertKg } },
        })
      }

      // 4. Update new stock (increment stock)
      for (const item of body.items) {
        varietyIdsToCheck.add(item.riceVarietyId)
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

      // Verify that no stock ended up negative after update
      for (const varietyId of varietyIdsToCheck) {
        const stock = await tx.stock.findUnique({
          where: {
            warehouseId_riceVarietyId: {
              warehouseId: warehouse.id,
              riceVarietyId: varietyId,
            },
          },
        })
        if (stock && stock.quantity < 0) {
          const varietyName = await tx.riceVariety.findUnique({ where: { id: varietyId } }).then(v => v?.name || 'variety')
          throw new Error(`Insufficient stock of ${varietyName} in warehouse to complete this update. Resulting stock would be ${stock.quantity.toLocaleString()} kg (negative).`)
        }
      }

      // 5. Delete old items
      await tx.purchaseItem.deleteMany({
        where: { purchaseId },
      })

      // 6. Update purchase
      const finalAmountPaid = body.paymentStatus === 'PAID' ? totalAmount : (body.amountPaid ?? 0)
      const finalPaymentDate = body.paymentDate 
        ? new Date(body.paymentDate) 
        : (body.paymentStatus === 'PAID' || body.paymentStatus === 'PARTIAL' ? new Date() : null)

      const updatedPurchase = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          supplierId: body.supplierId,
          purchaseDate: new Date(body.purchaseDate),
          totalAmount,
          paymentStatus: body.paymentStatus,
          amountPaid: finalAmountPaid,
          paymentMethod: body.paymentMethod,
          paymentDate: finalPaymentDate,
          invoiceDoc: body.invoiceDoc,
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

      // 7. Write audit log
      await tx.auditLog.create({
        data: {
          userId: req.user?.sub,
          action: 'PURCHASE_UPDATED',
          entityType: 'Purchase',
          entityId: purchaseId,
          oldValue: JSON.parse(JSON.stringify(existing)),
          newValue: JSON.parse(JSON.stringify(updatedPurchase)),
        },
      })

      return updatedPurchase
    })

    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update purchase.' })
  }
}

// ── POST /api/purchases/:id/payments ─────────────────────────────────────────
export async function addPurchasePayment(req: Request, res: Response) {
  const purchaseId = String(req.params.id)
  const { amount, paymentMethod, paymentDate, notes } = z.object({
    amount: z.number().positive(),
    paymentMethod: z.string().min(1),
    paymentDate: z.string().datetime().or(z.string().date()).optional(),
    notes: z.string().optional().nullable(),
  }).parse(req.body)

  const result = await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUniqueOrThrow({
      where: { id: purchaseId }
    })

    const newAmountPaid = purchase.amountPaid + amount
    let newStatus = purchase.paymentStatus
    if (newAmountPaid >= purchase.totalAmount) {
      newStatus = 'PAID'
    } else if (newAmountPaid > 0) {
      newStatus = 'PARTIAL'
    }

    // 1. Create payment record
    const payment = await tx.payment.create({
      data: {
        purchaseId,
        amount,
        paymentMethod,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        notes
      }
    })

    // 2. Update purchase
    await tx.purchase.update({
      where: { id: purchaseId },
      data: {
        amountPaid: newAmountPaid,
        paymentStatus: newStatus,
        paymentMethod: paymentMethod,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date()
      }
    })

    return payment
  })

  res.status(201).json(result)
}

// ── DELETE /api/purchases/:id/payments/:paymentId ──────────────────────────────
export async function deletePurchasePayment(req: Request, res: Response) {
  const purchaseId = String(req.params.id)
  const paymentId = String(req.params.paymentId)

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUniqueOrThrow({
      where: { id: paymentId }
    })

    const purchase = await tx.purchase.findUniqueOrThrow({
      where: { id: purchaseId }
    })

    const newAmountPaid = Math.max(0, purchase.amountPaid - payment.amount)
    let newStatus = purchase.paymentStatus
    if (newAmountPaid >= purchase.totalAmount) {
      newStatus = 'PAID'
    } else if (newAmountPaid > 0) {
      newStatus = 'PARTIAL'
    } else {
      newStatus = 'PENDING'
    }

    // 1. Delete payment record
    await tx.payment.delete({
      where: { id: paymentId }
    })

    // 2. Update purchase
    await tx.purchase.update({
      where: { id: purchaseId },
      data: {
        amountPaid: newAmountPaid,
        paymentStatus: newStatus
      }
    })
  })

  res.status(204).send()
}

