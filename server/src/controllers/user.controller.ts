import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { z } from 'zod'
import { RegisterSchema } from '../lib/schemas.js'
import bcrypt from 'bcrypt'

const UpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

export async function listUsers(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { firstName: 'asc' },
    include: { role: true },
  })
  res.json(users.map(u => {
    const { passwordHash, ...safeUser } = u
    return safeUser
  }))
}

export async function createUser(req: Request, res: Response) {
  const body = RegisterSchema.parse(req.body)
  
  let role = await prisma.role.findUnique({ where: { name: body.roleName } })
  if (!role) {
    role = await prisma.role.create({
      data: { name: body.roleName, permissions: [] }
    })
  }

  const passwordHash = await bcrypt.hash(body.password, 10)

  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      passwordHash,
      firstName: body.firstName,
      lastName: body.lastName,
      roleId: role.id,
    },
    include: { role: true }
  })
  
  const { passwordHash: _, ...safeUser } = user
  res.status(201).json(safeUser)
}

export async function getUser(req: Request, res: Response) {
  const user = await prisma.user.findFirstOrThrow({
    where: { id: String(req.params.id), deletedAt: null },
    include: { role: true }
  })
  const { passwordHash, ...safeUser } = user
  res.json(safeUser)
}

export async function updateUser(req: Request, res: Response) {
  const body = UpdateUserSchema.parse(req.body)
  const user = await prisma.user.update({
    where: { id: String(req.params.id) },
    data: body,
    include: { role: true }
  })
  const { passwordHash, ...safeUser } = user
  res.json(safeUser)
}

export async function deleteUser(req: Request, res: Response) {
  await prisma.user.update({
    where: { id: String(req.params.id) },
    data: { deletedAt: new Date(), isActive: false },
  })
  res.status(204).send()
}

