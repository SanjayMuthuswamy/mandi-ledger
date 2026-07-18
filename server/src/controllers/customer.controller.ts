import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  PaginationSchema,
} from '../lib/schemas.js'

export async function listCustomers(req: Request, res: Response) {
  const { page, limit } = PaginationSchema.parse(req.query)
  const skip = (page - 1) * limit

  const [total, customers] = await prisma.$transaction([
    prisma.customer.count({ where: { deletedAt: null } }),
    prisma.customer.findMany({
      where: { deletedAt: null },
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: { _count: { select: { sales: true } } },
    }),
  ])

  res.json({
    data: customers,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  })
}

export async function createCustomer(req: Request, res: Response) {
  const body = CreateCustomerSchema.parse(req.body)
  const customer = await prisma.customer.create({ data: body })
  res.status(201).json(customer)
}

export async function getCustomer(req: Request, res: Response) {
  const customer = await prisma.customer.findFirstOrThrow({
    where: { id: String(req.params.id), deletedAt: null },
    include: {
      sales: {
        where: { deletedAt: null },
        orderBy: { saleDate: 'desc' },
        take: 50,
        include: { items: { include: { variety: true } } },
      },
    },
  })
  res.json(customer)
}

export async function updateCustomer(req: Request, res: Response) {
  const body = UpdateCustomerSchema.parse(req.body)
  const customer = await prisma.customer.update({
    where: { id: String(req.params.id) },
    data: body,
  })
  res.json(customer)
}

export async function deleteCustomer(req: Request, res: Response) {
  await prisma.customer.update({
    where: { id: String(req.params.id) },
    data: { deletedAt: new Date() },
  })
  res.status(204).send()
}

