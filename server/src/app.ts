import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'
import { logger } from './lib/logger.js'

// Routers
import { authRouter } from './routes/auth.routes.js'
import { stockRouter } from './routes/stock.routes.js'
import { supplierRouter } from './routes/supplier.routes.js'
import { purchaseRouter } from './routes/purchase.routes.js'
import { salesRouter } from './routes/sales.routes.js'
import { customerRouter } from './routes/customer.routes.js'
import { riceVarietyRouter } from './routes/riceVariety.routes.js'
import { dashboardRouter } from './routes/dashboard.routes.js'
import { reportRouter } from './routes/report.routes.js'
import { warehouseRouter } from './routes/warehouse.routes.js'
import { userRouter } from './routes/user.routes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'

export const app = express()

// ── Security & Logging ──────────────────────────────────────────────────────
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  })
)
app.use(pinoHttp({ logger }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter)
app.use('/api/stock', stockRouter)
app.use('/api/suppliers', supplierRouter)
app.use('/api/purchases', purchaseRouter)
app.use('/api/sales', salesRouter)
app.use('/api/customers', customerRouter)
app.use('/api/rice-varieties', riceVarietyRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/reports', reportRouter)
app.use('/api/warehouses', warehouseRouter)
app.use('/api/users', userRouter)

// ── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)
