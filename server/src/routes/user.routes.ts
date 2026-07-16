import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authenticate } from '../middleware/authenticate.js'

export const userRouter = Router()
userRouter.use(authenticate)

userRouter.get('/', asyncHandler(userController.listUsers))
userRouter.post('/', asyncHandler(userController.createUser))
userRouter.get('/:id', asyncHandler(userController.getUser))
userRouter.put('/:id', asyncHandler(userController.updateUser))
userRouter.delete('/:id', asyncHandler(userController.deleteUser))
