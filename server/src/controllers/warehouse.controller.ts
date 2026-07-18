import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { z } from 'zod'
import { CreateWarehouseSchema } from '../lib/schemas.js'

const UpdateWarehouseSchema = CreateWarehouseSchema.partial()

export async function listWarehouses(_req: Request, res: Response) {
  const warehouses = await prisma.warehouse.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
  })
  res.json(warehouses)
}

export async function createWarehouse(req: Request, res: Response) {
  const body = CreateWarehouseSchema.parse(req.body)
  const warehouse = await prisma.warehouse.create({ data: body })
  res.status(201).json(warehouse)
}

export async function getWarehouse(req: Request, res: Response) {
  const warehouse = await prisma.warehouse.findFirstOrThrow({
    where: { id: String(req.params.id), deletedAt: null },
    include: { stocks: true }
  })
  res.json(warehouse)
}

export async function updateWarehouse(req: Request, res: Response) {
  const body = UpdateWarehouseSchema.parse(req.body)
  const warehouse = await prisma.warehouse.update({
    where: { id: String(req.params.id) },
    data: body,
  })
  res.json(warehouse)
}

export async function deleteWarehouse(req: Request, res: Response) {
  await prisma.warehouse.update({
    where: { id: String(req.params.id) },
    data: { deletedAt: new Date() },
  })
  res.status(204).send()
}

