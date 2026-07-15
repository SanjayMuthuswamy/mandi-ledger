import { Router } from 'express'
import * as riceVarietyController from '../controllers/riceVariety.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authenticate } from '../middleware/authenticate.js'

export const riceVarietyRouter = Router()
riceVarietyRouter.use(authenticate)

riceVarietyRouter.get('/', asyncHandler(riceVarietyController.listVarieties))
riceVarietyRouter.post('/', asyncHandler(riceVarietyController.createVariety))
riceVarietyRouter.get('/:id', asyncHandler(riceVarietyController.getVariety))
riceVarietyRouter.put('/:id', asyncHandler(riceVarietyController.updateVariety))
riceVarietyRouter.delete('/:id', asyncHandler(riceVarietyController.deleteVariety))
