import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcrypt'

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌾 Seeding Mandi Ledger database...')

  // ── Roles ──────────────────────────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      permissions: [
        'user:read', 'user:write',
        'inventory:read', 'inventory:write',
        'purchase:read', 'purchase:write',
        'sale:read', 'sale:write',
        'report:read',
      ],
    },
  })

  await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      permissions: [
        'inventory:read', 'inventory:write',
        'purchase:read', 'purchase:write',
        'sale:read', 'sale:write',
        'report:read',
      ],
    },
  })

  await prisma.role.upsert({
    where: { name: 'Accountant' },
    update: {},
    create: {
      name: 'Accountant',
      permissions: [
        'inventory:read',
        'purchase:read',
        'sale:read',
        'report:read',
      ],
    },
  })

  console.log('  ✓ Roles created')

  // ── Admin User ─────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@mandi.local' },
    update: {},
    create: {
      email: 'admin@mandi.local',
      passwordHash: await bcrypt.hash('Admin@1234', 12),
      firstName: 'Sanjay',
      lastName: 'Muthusamy',
      roleId: adminRole.id,
    },
  })

  console.log('  ✓ Admin user: admin@mandi.local / Admin@1234')
  console.log('\n✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
