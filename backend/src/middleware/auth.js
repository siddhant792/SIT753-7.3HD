import jwt from 'jsonwebtoken'
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js'

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided')
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token'))
    } else if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired'))
    } else {
      next(error)
    }
  }
}

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'))
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return next(new UnauthorizedError('Insufficient permissions'))
    }

    next()
  }
}

const requireTenant = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'))
  }

  if (!req.user.tenantId) {
    return next(new ForbiddenError('Tenant access required'))
  }

  next()
}

export {
  authenticate,
  authorize,
  requireTenant
} 