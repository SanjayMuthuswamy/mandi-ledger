import { Router } from 'express'
import * as stockController from '../controllers/stock.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authenticate } from '../middleware/authenticate.js'

export const stockRouter = Router()

// All stock routes require a valid JWT
stockRouter.use(authenticate)

// GET    /api/stock            – list all stock entries (with variety info)
stockRouter.get('/', asyncHandler(stockController.listStock))

// POST   /api/stock            – create a new stock entry
stockRouter.post('/', asyncHandler(stockController.createStock))

// GET    /api/stock/low        – stock items below minimum threshold
stockRouter.get('/low', asyncHandler(stockController.listLowStock))

// GET    /api/stock/:id        – get single stock entry
stockRouter.get('/:id', asyncHandler(stockController.getStock))

// PATCH  /api/stock/:id        – update quantity (used by the frontend hook)
stockRouter.patch('/:id', asyncHandler(stockController.updateStockQuantity))

// DELETE /api/stock/:id        – soft-delete not required for stock; hard delete
stockRouter.delete('/:id', asyncHandler(stockController.deleteStock))

