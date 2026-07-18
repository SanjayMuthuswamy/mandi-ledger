import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authenticate } from '../middleware/authenticate.js'

export const authRouter = Router()

// POST /api/auth/register
authRouter.post('/register', asyncHandler(authController.register))

// POST /api/auth/login
authRouter.post('/login', asyncHandler(authController.login))

// POST /api/auth/refresh
authRouter.post('/refresh', asyncHandler(authController.refresh))

// POST /api/auth/logout
authRouter.post('/logout', authenticate, asyncHandler(authController.logout))

// GET  /api/auth/me
authRouter.get('/me', authenticate, asyncHandler(authController.me))

