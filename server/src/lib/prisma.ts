import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { logger } from './logger.js'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  const url = process.env['DATABASE_URL']!

  // Use pg adapter for direct postgres:// connections (local dev server)
  const pool = new pg.Pool({ connectionString: url })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

// Re-use a single PrismaClient instance in dev (hot-reloading safety)
export const prisma: PrismaClient =
  globalThis.__prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

logger.debug('Prisma client initialized')
