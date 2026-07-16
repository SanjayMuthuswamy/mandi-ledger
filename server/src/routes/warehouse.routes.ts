import { Router } from 'express'
import * as warehouseController from '../controllers/warehouse.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authenticate } from '../middleware/authenticate.js'

export const warehouseRouter = Router()
warehouseRouter.use(authenticate)

warehouseRouter.get('/', asyncHandler(warehouseController.listWarehouses))
warehouseRouter.post('/', asyncHandler(warehouseController.createWarehouse))
warehouseRouter.get('/:id', asyncHandler(warehouseController.getWarehouse))
warehouseRouter.put('/:id', asyncHandler(warehouseController.updateWarehouse))
warehouseRouter.delete('/:id', asyncHandler(warehouseController.deleteWarehouse))
