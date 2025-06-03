import Joi from 'joi'

const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  tenantId: Joi.string().uuid().optional(),
  tenantName: Joi.string().min(2).max(50).optional(),
  role: Joi.string().valid('user', 'admin').default('user')
}).required()

const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required()
}).required()

export {
  registerSchema,
  loginSchema
} 