import { Router } from 'express'
import * as purchaseController from '../controllers/purchase.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authenticate } from '../middleware/authenticate.js'

export const purchaseRouter = Router()
purchaseRouter.use(authenticate)

// GET    /api/purchases              – paginated list (filter by supplierId, date range)
purchaseRouter.get('/', asyncHandler(purchaseController.listPurchases))

// POST   /api/purchases              – create purchase + update stock
purchaseRouter.post('/', asyncHandler(purchaseController.createPurchase))

// GET    /api/purchases/:id          – get one with items
purchaseRouter.get('/:id', asyncHandler(purchaseController.getPurchase))

// PATCH  /api/purchases/:id/status   – update payment status
purchaseRouter.patch(
  '/:id/status',
  asyncHandler(purchaseController.updatePurchaseStatus)
)

// DELETE /api/purchases/:id          – soft delete
purchaseRouter.delete('/:id', asyncHandler(purchaseController.deletePurchase))
