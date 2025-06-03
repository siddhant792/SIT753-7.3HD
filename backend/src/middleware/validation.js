import Joi from 'joi'
import { ValidationError } from '../utils/errors.js'

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))

      return next(new ValidationError('Validation failed', errors))
    }

    next()
  }
}

const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required(),
    tenantId: Joi.string().uuid().optional(),
    tenantName: Joi.string().min(2).max(50).optional(),
    role: Joi.string().valid('user', 'admin').default('user')
  }),

  task: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(1000),
    priority: Joi.string().valid('low', 'medium', 'high').required(),
    status: Joi.string().valid('todo', 'in_progress', 'done').required(),
    dueDate: Joi.date().iso().required(),
    assigneeId: Joi.string().uuid(),
    tags: Joi.array().items(Joi.string())
  }),

  tenant: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    plan: Joi.string().valid('free', 'pro', 'enterprise').required(),
    settings: Joi.object({
      maxUsers: Joi.number().integer().min(1),
      features: Joi.array().items(Joi.string())
    })
  }),

  user: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('admin', 'user').required()
  }),

  notification: Joi.object({
    type: Joi.string().valid('task', 'comment', 'mention', 'system').required(),
    title: Joi.string().required(),
    message: Joi.string().required(),
    link: Joi.string().uri()
  })
}

export {
  validateRequest,
  schemas
} 