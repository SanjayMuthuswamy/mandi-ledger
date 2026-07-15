import { Router } from 'express'
import * as dashboardController from '../controllers/dashboard.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authenticate } from '../middleware/authenticate.js'

export const dashboardRouter = Router()
dashboardRouter.use(authenticate)

// GET /api/dashboard/summary  – KPI cards + today's ledger entries
dashboardRouter.get('/summary', asyncHandler(dashboardController.getSummary))
