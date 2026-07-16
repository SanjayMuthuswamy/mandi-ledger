import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { logger } from './logger.js'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  const connectionString = process.env['DATABASE_URL']!
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

// Re-use a single PrismaClient instance in dev (hot-reloading safety)
export const prisma: PrismaClient =
  globalThis.__prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

logger.debug('Prisma client initialized')
