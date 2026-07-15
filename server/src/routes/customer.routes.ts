import { Router } from 'express'
import * as customerController from '../controllers/customer.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authenticate } from '../middleware/authenticate.js'

export const customerRouter = Router()
customerRouter.use(authenticate)

customerRouter.get('/', asyncHandler(customerController.listCustomers))
customerRouter.post('/', asyncHandler(customerController.createCustomer))
customerRouter.get('/:id', asyncHandler(customerController.getCustomer))
customerRouter.put('/:id', asyncHandler(customerController.updateCustomer))
customerRouter.delete('/:id', asyncHandler(customerController.deleteCustomer))
