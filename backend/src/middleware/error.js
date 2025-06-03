import logger from '../utils/logger.js'
import { ValidationError, NotFoundError, UnauthorizedError } from '../utils/errors.js'

const errorHandler = (err, req, res, next) => {
  logger.error(err)

  // If headers are already sent, delegate to Express's default error handler
  if (res.headersSent) {
    return next(err)
  }

  // Handle specific error types
  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      errors: err.errors
    })
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      status: 'error',
      message: err.message
    })
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      status: 'error',
      message: err.message
    })
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    })
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      status: 'error',
      message: 'Duplicate entry',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    })
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    })
  }

  // Handle all other errors
  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  })
}

export default errorHandler 