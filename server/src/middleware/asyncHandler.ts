import type { RequestHandler } from 'express'

/**
 * Wraps an async route handler so that any thrown error
 * is passed automatically to Express's next(err).
 */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

