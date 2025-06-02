const Joi = require('joi')
const { ValidationError } = require('../utils/errors')

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

      throw new ValidationError('Validation failed', errors)
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
    password: Joi.string().min(8).required(),
    tenantName: Joi.string().min(2).max(50).required()
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

module.exports = {
  validateRequest,
  schemas
} 