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
    { varietyIdx: 0, quantity: 4500, minThreshold: 2000, maxCapacity: 10000 },
    { varietyIdx: 1, quantity: 1200, minThreshold: 2000, maxCapacity: 10000 },
    { varietyIdx: 2, quantity: 8000, minThreshold: 3000, maxCapacity: 15000 },
    { varietyIdx: 3, quantity: 3500, minThreshold: 1500, maxCapacity: 8000 },
    { varietyIdx: 4, quantity: 600,  minThreshold: 1000, maxCapacity: 5000 },
    { varietyIdx: 5, quantity: 300,  minThreshold: 500,  maxCapacity: 3000 },
  ]

  for (const s of stockData) {
    const variety = varieties[s.varietyIdx]
    if (!variety) continue
    await prisma.stock.upsert({
      where: { warehouseId_riceVarietyId: { warehouseId: warehouse.id, riceVarietyId: variety.id } },
      update: { quantity: s.quantity },
      create: {
        warehouseId: warehouse.id,
        riceVarietyId: variety.id,
        quantity: s.quantity,
        minThreshold: s.minThreshold,
        maxCapacity: s.maxCapacity,
      },
    })
  }

  console.log('  ✓ Initial stock loaded')

  // ── Suppliers ──────────────────────────────────────────────────────────────
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { id: 'sup-001' },
      update: {},
      create: { id: 'sup-001', name: 'Rajesh Traders', contactName: 'Rajesh Kumar', phone: '+91 98765 43210', address: 'Tiruppur', rating: 4.5 },
    }),
    prisma.supplier.upsert({
      where: { id: 'sup-002' },
      update: {},
      create: { id: 'sup-002', name: 'Sri Balaji Agro', contactName: 'Balaji Reddy', phone: '+91 98765 43211', address: 'Kurnool, Andhra Pradesh', rating: 4.2 },
    }),
    prisma.supplier.upsert({
      where: { id: 'sup-003' },
      update: {},
      create: { id: 'sup-003', name: 'Punjab Rice Mills', contactName: 'Gurpreet Singh', phone: '+91 98765 43212', address: 'Karnal, Haryana', rating: 4.8 },
    }),
  ])

  console.log('  ✓ Suppliers created')

  // ── Customers ──────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.customer.upsert({
      where: { id: 'cust-001' },
      update: {},
      create: { id: 'cust-001', name: 'Mani Retail Store', phone: '+91 99887 76655', address: 'Coimbatore' },
    }),
    prisma.customer.upsert({
      where: { id: 'cust-002' },
      update: {},
      create: { id: 'cust-002', name: 'Hotel Saravana', phone: '+91 99887 76656', address: 'Chennai' },
    }),
    prisma.customer.upsert({
      where: { id: 'cust-003' },
      update: {},
      create: { id: 'cust-003', name: 'Green Grocers', phone: '+91 99887 76657', address: 'Madurai' },
    }),
  ])

  console.log('  ✓ Customers created')

  // ── Sample Purchases ───────────────────────────────────────────────────────
  const ponni   = varieties[0]!
  const sona    = varieties[1]!
  const basmati = varieties[2]!

  await prisma.purchase.upsert({
    where: { entryNo: 'P-1042' },
    update: {},
    create: {
      entryNo: 'P-1042',
      supplierId: suppliers[0]!.id,
      purchaseDate: new Date('2026-07-14'),
      totalAmount: 4500 * 42,
      paymentStatus: 'PAID',
      items: { create: [{ riceVarietyId: ponni.id, quantity: 4500, rate: 42, total: 4500 * 42 }] },
    },
  })

  await prisma.purchase.upsert({
    where: { entryNo: 'P-1041' },
    update: {},
    create: {
      entryNo: 'P-1041',
      supplierId: suppliers[1]!.id,
      purchaseDate: new Date('2026-07-13'),
      totalAmount: 1200 * 54,
      paymentStatus: 'PENDING',
      items: { create: [{ riceVarietyId: sona.id, quantity: 1200, rate: 54, total: 1200 * 54 }] },
    },
  })

  await prisma.purchase.upsert({
    where: { entryNo: 'P-1040' },
    update: {},
    create: {
      entryNo: 'P-1040',
      supplierId: suppliers[2]!.id,
      purchaseDate: new Date('2026-07-12'),
      totalAmount: 5000 * 105,
      paymentStatus: 'PAID',
      items: { create: [{ riceVarietyId: basmati.id, quantity: 5000, rate: 105, total: 5000 * 105 }] },
    },
  })

  console.log('  ✓ Sample purchases created')

  // ── Sample Sales ───────────────────────────────────────────────────────────
  await prisma.sale.upsert({
    where: { invoiceNo: 'S-2051' },
    update: {},
    create: {
      invoiceNo: 'S-2051',
      customerId: 'cust-001',
      saleDate: new Date('2026-07-14'),
      totalAmount: 1200 * 48,
      paymentStatus: 'PAID',
      items: { create: [{ riceVarietyId: ponni.id, quantity: 1200, rate: 48, total: 1200 * 48 }] },
    },
  })

  await prisma.sale.upsert({
    where: { invoiceNo: 'S-2050' },
    update: {},
    create: {
      invoiceNo: 'S-2050',
      customerId: 'cust-002',
      saleDate: new Date('2026-07-14'),
      totalAmount: 450 * 42,
      paymentStatus: 'PENDING',
      items: { create: [{ riceVarietyId: varieties[3]!.id, quantity: 450, rate: 42, total: 450 * 42 }] },
    },
  })

  console.log('  ✓ Sample sales created')
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
