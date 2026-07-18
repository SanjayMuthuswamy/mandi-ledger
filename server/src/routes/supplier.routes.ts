import { Router } from 'express'
import * as supplierController from '../controllers/supplier.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authenticate } from '../middleware/authenticate.js'

export const supplierRouter = Router()
supplierRouter.use(authenticate)

// GET    /api/suppliers              – paginated list
supplierRouter.get('/', asyncHandler(supplierController.listSuppliers))

// POST   /api/suppliers              – create
supplierRouter.post('/', asyncHandler(supplierController.createSupplier))

// GET    /api/suppliers/:id          – get one (with purchase history)
supplierRouter.get('/:id', asyncHandler(supplierController.getSupplier))

// PUT    /api/suppliers/:id          – full update
supplierRouter.put('/:id', asyncHandler(supplierController.updateSupplier))

// DELETE /api/suppliers/:id          – soft delete
supplierRouter.delete('/:id', asyncHandler(supplierController.deleteSupplier))

