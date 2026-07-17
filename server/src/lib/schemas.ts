import { z } from 'zod'

// ── Auth ─────────────────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roleName: z.string().optional().default('Accountant'),
})

// ── Rice Variety ─────────────────────────────────────────────────────────────
export const CreateRiceVarietySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.number().positive(),
})

export const UpdateRiceVarietySchema = CreateRiceVarietySchema.partial()

// ── Warehouse ─────────────────────────────────────────────────────────────────
export const CreateWarehouseSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
  capacity: z.number().positive().optional(),
})

// ── Stock ─────────────────────────────────────────────────────────────────────
export const UpdateStockQuantitySchema = z.object({
  quantity: z.number().nonnegative(),
})

export const CreateStockSchema = z.object({
  warehouseId: z.string(),
  riceVarietyId: z.string(),
  quantity: z.number().nonnegative(),
  minThreshold: z.number().nonnegative(),
  maxCapacity: z.number().positive().optional(),
})

// ── Supplier ──────────────────────────────────────────────────────────────────
export const CreateSupplierSchema = z.object({
  name: z.string().min(1),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.email().optional().or(z.literal('')),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
})

export const UpdateSupplierSchema = CreateSupplierSchema.partial()

// ── Customer ──────────────────────────────────────────────────────────────────
export const CreateCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.email().optional().or(z.literal('')),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
})

export const UpdateCustomerSchema = CreateCustomerSchema.partial()

// ── Purchase ──────────────────────────────────────────────────────────────────
export const PurchaseItemSchema = z.object({
  riceVarietyId: z.string(),
  quantity: z.number().positive(),
  kgPerBag: z.number().positive().optional().default(26),
  rate: z.number().positive(),
})

export const CreatePurchaseSchema = z.object({
  supplierId: z.string(),
  purchaseDate: z.string().datetime().or(z.string().date()),
  paymentStatus: z
    .enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'])
    .optional()
    .default('PENDING'),
  invoiceDoc: z.string().optional(),
  items: z.array(PurchaseItemSchema).min(1),
})

export const UpdatePurchaseStatusSchema = z.object({
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE']),
})

// ── Sale ─────────────────────────────────────────────────────────────────────
export const SaleItemSchema = z.object({
  riceVarietyId: z.string(),
  quantity: z.number().positive(),
  kgPerBag: z.number().positive().optional().default(26),
  rate: z.number().positive(),
})

export const CreateSaleSchema = z.object({
  customerId: z.string(),
  saleDate: z.string().datetime().or(z.string().date()),
  paymentStatus: z
    .enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'])
    .optional()
    .default('PENDING'),
  items: z.array(SaleItemSchema).min(1),
})

export const UpdateSaleStatusSchema = z.object({
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE']),
})

// ── Pagination ────────────────────────────────────────────────────────────────
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})
