import { Router } from 'express'
import * as reportController from '../controllers/report.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authenticate } from '../middleware/authenticate.js'

export const reportRouter = Router()
reportRouter.use(authenticate)

// GET /api/reports/profit-loss?from=&to=
reportRouter.get('/profit-loss', asyncHandler(reportController.profitLoss))

// GET /api/reports/stock-movement?from=&to=&varietyId=
reportRouter.get('/stock-movement', asyncHandler(reportController.stockMovement))

// GET /api/reports/top-suppliers?limit=5
reportRouter.get('/top-suppliers', asyncHandler(reportController.topSuppliers))

// GET /api/reports/top-customers?limit=5
reportRouter.get('/top-customers', asyncHandler(reportController.topCustomers))
