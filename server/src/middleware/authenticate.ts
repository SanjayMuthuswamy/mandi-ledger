import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, type AccessTokenPayload } from '../lib/jwt.js'

// Augment Express Request to carry decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' })
    return
  }

  const token = header.slice(7)
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    res.status(401).json({ error: 'Token expired or invalid' })
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }
    if (!allowedRoles.includes(req.user.roleName)) {
      res
        .status(403)
        .json({ error: `Requires one of: ${allowedRoles.join(', ')}` })
      return
    }
    next()
  }
}

