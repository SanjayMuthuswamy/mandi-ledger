import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import {
  UpdateStockQuantitySchema,
  CreateStockSchema,
} from '../lib/schemas.js'

// ── GET /api/stock ────────────────────────────────────────────────────────────
export async function listStock(_req: Request, res: Response) {
  const entries = await prisma.stock.findMany({
    include: {
      variety: true,
      warehouse: true,
    }
  })

  entries.sort((a, b) => a.variety.name.localeCompare(b.variety.name))

  // Shape to match the StockEntry interface expected by the frontend hook
  const shaped = entries.map((s) => ({
    id: s.id,
    varietyId: s.variety.code,          // matches frontend's VarietyId convention
    varietyName: s.variety.name,
    quantity: s.quantity,
    price: s.variety.basePrice,
    threshold: s.minThreshold,
    max: s.maxCapacity ?? s.minThreshold * 5,
    lastUpdated: s.updatedAt.toISOString().split('T')[0],
    warehouseId: s.warehouseId,
    warehouseName: s.warehouse.name,
  }))

  res.json(shaped)
}

// ── POST /api/stock ───────────────────────────────────────────────────────────
export async function createStock(req: Request, res: Response) {
  // Gracefully handle the legacy frontend format
  const isLegacy = req.body.varietyId !== undefined

  if (isLegacy) {
    const warehouse = await prisma.warehouse.findFirst()
    if (!warehouse) throw new Error("No warehouse configured")
    const variety = await prisma.riceVariety.findUnique({ where: { code: req.body.varietyId } })
    if (!variety) throw new Error("Variety not found")
    
    const entry = await prisma.stock.upsert({
      where: {
        warehouseId_riceVarietyId: {
          warehouseId: warehouse.id,
          riceVarietyId: variety.id,
        }
      },
      update: {
        quantity: { increment: req.body.quantity },
        minThreshold: req.body.threshold || undefined,
        maxCapacity: req.body.max || undefined,
      },
      create: {
        warehouseId: warehouse.id,
        riceVarietyId: variety.id,
        quantity: req.body.quantity,
        minThreshold: req.body.threshold || 0,
        maxCapacity: req.body.max || 10000,
      },
      include: { variety: true, warehouse: true },
    })
    res.status(201).json(entry)
    return
  }

  const body = CreateStockSchema.parse(req.body)
  const entry = await prisma.stock.upsert({
    where: {
      warehouseId_riceVarietyId: {
        warehouseId: body.warehouseId,
        riceVarietyId: body.riceVarietyId,
      }
    },
    update: {
      quantity: { increment: body.quantity },
      minThreshold: body.minThreshold,
      maxCapacity: body.maxCapacity,
    },
    create: body,
    include: { variety: true, warehouse: true },
  })

  res.status(201).json(entry)
}

// ── GET /api/stock/low ────────────────────────────────────────────────────────
export async function listLowStock(_req: Request, res: Response) {
  const entries = await prisma.stock.findMany({
    where: {
      quantity: { lt: prisma.stock.fields.minThreshold as never },
    },
    include: { variety: true, warehouse: true },
  })

  // Fallback: fetch all and filter in JS (Prisma doesn't support field-to-field comparison directly without raw SQL)
  const all = await prisma.stock.findMany({
    include: { variety: true, warehouse: true },
  })

  const low = all.filter((s) => s.quantity < s.minThreshold)
  res.json(
    low.map((s) => ({
      id: s.id,
      varietyId: s.variety.code,
      varietyName: s.variety.name,
      quantity: s.quantity,
      minThreshold: s.minThreshold,
      warehouseName: s.warehouse.name,
    }))
  )
}

// ── GET /api/stock/:id ────────────────────────────────────────────────────────
export async function getStock(req: Request, res: Response) {
  const entry = await prisma.stock.findUniqueOrThrow({
    where: { id: req.params.id },
    include: { variety: true, warehouse: true },
  })
  res.json(entry)
}

// ── PATCH /api/stock/:id ──────────────────────────────────────────────────────
export async function updateStockQuantity(req: Request, res: Response) {
  const { quantity } = UpdateStockQuantitySchema.parse(req.body)

  const updated = await prisma.stock.update({
    where: { id: req.params.id },
    data: { quantity },
    include: { variety: true, warehouse: true },
  })

  res.json({
    id: updated.id,
    varietyId: updated.variety.code,
    varietyName: updated.variety.name,
    quantity: updated.quantity,
    price: updated.variety.basePrice,
    threshold: updated.minThreshold,
    max: updated.maxCapacity ?? updated.minThreshold * 5,
    lastUpdated: updated.updatedAt.toISOString().split('T')[0],
  })
}

// ── DELETE /api/stock/:id ─────────────────────────────────────────────────────
export async function deleteStock(req: Request, res: Response) {
  await prisma.stock.delete({ where: { id: req.params.id } })
  res.status(204).send()
}
