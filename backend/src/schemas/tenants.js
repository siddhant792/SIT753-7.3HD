import Joi from 'joi'

const tenantSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  plan: Joi.string().valid('free', 'pro', 'enterprise').default('free'),
  customDomain: Joi.string().domain().allow(null),
  settings: Joi.object({
    userLimit: Joi.number().min(1).max(1000).default(10),
    theme: Joi.object({
      primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#4A90E2'),
      secondaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#50E3C2'),
      logo: Joi.string().uri().allow(null)
    }).default()
  }).default()
}).required()

const settingsSchema = Joi.object({
  settings: Joi.object({
    userLimit: Joi.number().min(1).max(1000),
    theme: Joi.object({
      primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
      secondaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
      logo: Joi.string().uri().allow(null)
    })
  }).required()
}).required()

const subscriptionSchema = Joi.object({
  plan: Joi.string().valid('free', 'pro', 'enterprise').required(),
  billing: Joi.object({
    paymentMethod: Joi.string().valid('credit_card', 'bank_transfer').required(),
    billingCycle: Joi.string().valid('monthly', 'yearly').required(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP').default('USD'),
    billingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      postalCode: Joi.string().required()
    }).required()
  }).required()
}).required()

export {
  tenantSchema,
  settingsSchema,
  subscriptionSchema
} 