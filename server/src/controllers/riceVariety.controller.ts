import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import {
  CreateRiceVarietySchema,
  UpdateRiceVarietySchema,
} from '../lib/schemas.js'

export async function listVarieties(_req: Request, res: Response) {
  const varieties = await prisma.riceVariety.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
    include: {
      stocks: {
        select: { quantity: true, minThreshold: true },
      },
    },
  })
  res.json(varieties)
}

export async function createVariety(req: Request, res: Response) {
  const body = CreateRiceVarietySchema.parse(req.body)
  const variety = await prisma.riceVariety.create({ data: body })
  res.status(201).json(variety)
}

export async function getVariety(req: Request, res: Response) {
  const variety = await prisma.riceVariety.findFirstOrThrow({
    where: { id: String(req.params.id), deletedAt: null },
    include: {
      stocks: { include: { warehouse: true } },
    },
  })
  res.json(variety)
}

export async function updateVariety(req: Request, res: Response) {
  const body = UpdateRiceVarietySchema.parse(req.body)
  const variety = await prisma.riceVariety.update({
    where: { id: String(req.params.id) },
    data: body,
  })
  res.json(variety)
}

export async function deleteVariety(req: Request, res: Response) {
  await prisma.riceVariety.update({
    where: { id: String(req.params.id) },
    data: { deletedAt: new Date() },
  })
  res.status(204).send()
}

