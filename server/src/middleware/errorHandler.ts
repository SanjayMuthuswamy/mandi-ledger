import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '../lib/logger.js'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      issues: err.flatten().fieldErrors,
    })
    return
  }

  // Prisma unique constraint violation (P2002)
  if (
    err != null &&
    typeof err === 'object' &&
    'code' in err &&
    err.code === 'P2002'
  ) {
    res.status(409).json({ error: 'A record with those values already exists' })
    return
  }

  // Prisma record not found (P2025)
  if (
    err != null &&
    typeof err === 'object' &&
    'code' in err &&
    err.code === 'P2025'
  ) {
    res.status(404).json({ error: 'Record not found' })
    return
  }

  // Generic server error
  logger.error(err, 'Unhandled error')
  console.error('Unhandled error:', err)
  res.status(500).json({ 
    error: 'Internal server error', 
    details: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined
  })
}

