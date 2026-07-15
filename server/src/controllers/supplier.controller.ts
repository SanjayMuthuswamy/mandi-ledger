import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import {
  CreateSupplierSchema,
  UpdateSupplierSchema,
  PaginationSchema,
} from '../lib/schemas.js'

// ── GET /api/suppliers ────────────────────────────────────────────────────────
export async function listSuppliers(req: Request, res: Response) {
  const { page, limit } = PaginationSchema.parse(req.query)
  const skip = (page - 1) * limit

  const [total, suppliers] = await prisma.$transaction([
    prisma.supplier.count({ where: { deletedAt: null } }),
    prisma.supplier.findMany({
      where: { deletedAt: null },
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { purchases: true } },
      },
    }),
  ])

  res.json({
    data: suppliers,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  })
}

// ── POST /api/suppliers ───────────────────────────────────────────────────────
export async function createSupplier(req: Request, res: Response) {
  const body = CreateSupplierSchema.parse(req.body)
  const supplier = await prisma.supplier.create({ data: body })
  res.status(201).json(supplier)
}

// ── GET /api/suppliers/:id ────────────────────────────────────────────────────
export async function getSupplier(req: Request, res: Response) {
  const supplier = await prisma.supplier.findFirstOrThrow({
    where: { id: req.params.id, deletedAt: null },
    include: {
      purchases: {
        where: { deletedAt: null },
        orderBy: { purchaseDate: 'desc' },
        take: 50,
        include: { items: { include: { variety: true } } },
      },
    },
  })

  // Calculate total volume supplied
  const totalVolume = supplier.purchases.reduce(
    (sum, p) => sum + p.items.reduce((s, i) => s + i.quantity, 0),
    0
  )

  res.json({ ...supplier, totalVolume })
}

// ── PUT /api/suppliers/:id ────────────────────────────────────────────────────
export async function updateSupplier(req: Request, res: Response) {
  const body = UpdateSupplierSchema.parse(req.body)
  const supplier = await prisma.supplier.update({
    where: { id: req.params.id },
    data: body,
  })
  res.json(supplier)
}

// ── DELETE /api/suppliers/:id ─────────────────────────────────────────────────
export async function deleteSupplier(req: Request, res: Response) {
  await prisma.supplier.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  })
  res.status(204).send()
}
