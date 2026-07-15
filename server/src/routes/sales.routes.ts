import { Router } from 'express'
import * as salesController from '../controllers/sales.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authenticate } from '../middleware/authenticate.js'

export const salesRouter = Router()
salesRouter.use(authenticate)

// GET    /api/sales              – paginated list
salesRouter.get('/', asyncHandler(salesController.listSales))

// POST   /api/sales              – create sale + deduct stock
salesRouter.post('/', asyncHandler(salesController.createSale))

// GET    /api/sales/:id          – get one with items
salesRouter.get('/:id', asyncHandler(salesController.getSale))

// PATCH  /api/sales/:id/status   – update payment status
salesRouter.patch('/:id/status', asyncHandler(salesController.updateSaleStatus))

// DELETE /api/sales/:id          – soft delete
salesRouter.delete('/:id', asyncHandler(salesController.deleteSale))
