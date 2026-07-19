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

  // ── Warehouse ──────────────────────────────────────────────────────────────
  const warehouse = await prisma.warehouse.upsert({
    where: { id: 'wh-main-001' },
    update: {},
    create: {
      id: 'wh-main-001',
      name: 'Main Warehouse',
      location: 'Tiruppur, Tamil Nadu',
      capacity: 500000,
    },
  })

  console.log('  ✓ Warehouse created')

  // ── Rice Varieties ─────────────────────────────────────────────────────────
  const varieties = await Promise.all([
    prisma.riceVariety.upsert({
      where: { code: 'ponni' },
      update: {},
      create: { name: 'Ponni Boiled', code: 'ponni', description: 'Popular South Indian boiled rice', basePrice: 42 },
    }),
    prisma.riceVariety.upsert({
      where: { code: 'sona' },
      update: {},
      create: { name: 'Sona Masuri', code: 'sona', description: 'Light and aromatic variety', basePrice: 54 },
    }),
    prisma.riceVariety.upsert({
      where: { code: 'basmati' },
      update: {},
      create: { name: 'Basmati Premium', code: 'basmati', description: 'Long-grain aromatic Basmati', basePrice: 110 },
    }),
    prisma.riceVariety.upsert({
      where: { code: 'idli' },
      update: {},
      create: { name: 'Idli Rice', code: 'idli', description: 'Parboiled rice for idli/dosa', basePrice: 38 },
    }),
    prisma.riceVariety.upsert({
      where: { code: 'brown' },
      update: {},
      create: { name: 'Brown Rice', code: 'brown', description: 'Whole grain unpolished rice', basePrice: 72 },
    }),
    prisma.riceVariety.upsert({
      where: { code: 'black' },
      update: {},
      create: { name: 'Black Rice', code: 'black', description: 'Forbidden black rice, antioxidant-rich', basePrice: 95 },
    }),
  ])

  console.log('  ✓ Rice varieties created')

  // ── Initial Stock ──────────────────────────────────────────────────────────
  const stockData = [
    { varietyIdx: 0, quantity: 0, minThreshold: 2000, maxCapacity: 10000 },
    { varietyIdx: 1, quantity: 0, minThreshold: 2000, maxCapacity: 10000 },
    { varietyIdx: 2, quantity: 0, minThreshold: 3000, maxCapacity: 15000 },
    { varietyIdx: 3, quantity: 0, minThreshold: 1500, maxCapacity: 8000 },
    { varietyIdx: 4, quantity: 0, minThreshold: 1000, maxCapacity: 5000 },
    { varietyIdx: 5, quantity: 0, minThreshold: 500,  maxCapacity: 3000 },
  ]

  for (const s of stockData) {
    const variety = varieties[s.varietyIdx]
    if (!variety) continue
    await prisma.stock.upsert({
      where: { warehouseId_riceVarietyId: { warehouseId: warehouse.id, riceVarietyId: variety.id } },
      update: {},
      create: {
        warehouseId: warehouse.id,
        riceVarietyId: variety.id,
        quantity: s.quantity,
        minThreshold: s.minThreshold,
        maxCapacity: s.maxCapacity,
      },
    })
  }

  console.log('  ✓ Initial stock loaded (initialized to 0)')
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
