import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/jwt.js'
import {
  LoginSchema,
  RegisterSchema,
} from '../lib/schemas.js'

const SALT_ROUNDS = 12

// ── POST /api/auth/register ─────────────────────────────────────────────────
export async function register(req: Request, res: Response) {
  const body = RegisterSchema.parse(req.body)

  // Find or create the requested role
  let role = await prisma.role.findUnique({ where: { name: body.roleName } })
  if (!role) {
    role = await prisma.role.create({
      data: { name: body.roleName, permissions: [] },
    })
  }

  const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash,
      firstName: body.firstName,
      lastName: body.lastName,
      roleId: role.id,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: { select: { name: true } },
    },
  })

  res.status(201).json({ user })
}

// ── POST /api/auth/login ────────────────────────────────────────────────────
export async function login(req: Request, res: Response) {
  const { email, password } = LoginSchema.parse(req.body)

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  })

  if (!user || !user.isActive) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    roleId: user.roleId,
    roleName: user.role.name,
  })
  const refreshToken = signRefreshToken(user.id)

  // Persist refresh token
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent'],
    },
  })

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
    },
  })
}

// ── POST /api/auth/refresh ──────────────────────────────────────────────────
export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken?: string }
  if (!refreshToken) {
    res.status(400).json({ error: 'refreshToken is required' })
    return
  }

  let payload: { sub: string }
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' })
    return
  }

  const session = await prisma.session.findUnique({
    where: { refreshToken },
    include: { user: { include: { role: true } } },
  })

  if (!session || session.isRevoked || session.expiresAt < new Date()) {
    res.status(401).json({ error: 'Session expired or revoked' })
    return
  }

  if (session.userId !== payload.sub) {
    res.status(401).json({ error: 'Token mismatch' })
    return
  }

  // Rotate refresh token
  const newRefreshToken = signRefreshToken(session.userId)
  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  const newAccessToken = signAccessToken({
    sub: session.user.id,
    email: session.user.email,
    roleId: session.user.roleId,
    roleName: session.user.role.name,
  })

  res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
}

// ── POST /api/auth/logout ───────────────────────────────────────────────────
export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken?: string }
  if (refreshToken) {
    await prisma.session
      .update({
        where: { refreshToken },
        data: { isRevoked: true },
      })
      .catch(() => {
        /* session may not exist — ignore */
      })
  }
  res.json({ message: 'Logged out' })
}

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      role: { select: { name: true, permissions: true } },
    },
  })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json(user)
}
