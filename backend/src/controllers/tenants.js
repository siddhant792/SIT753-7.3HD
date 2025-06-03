import { Tenant, User } from '../models/index.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'
import emailService from '../services/email.js'

const createTenant = async (req, res, next) => {
  try {
    const { name, plan, settings, customDomain } = req.body

    const existingTenant = await Tenant.findOne({ where: { name } })
    if (existingTenant) {
      throw new ValidationError('Tenant name already exists')
    }

    if (customDomain) {
      const existingDomain = await Tenant.findOne({ where: { customDomain } })
      if (existingDomain) {
        throw new ValidationError('Custom domain already in use')
      }
    }

    const tenant = await Tenant.create({
      name,
      plan,
      settings,
      customDomain,
      subscription: {
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    res.status(201).json(tenant)
  } catch (error) {
    next(error)
  }
}

const getTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    })

    res.json(tenants)
  } catch (error) {
    next(error)
  }
}

const getTenant = async (req, res, next) => {
  try {
    const { id } = req.params

    const tenant = await Tenant.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    })

    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }

    res.json(tenant)
  } catch (error) {
    next(error)
  }
}

const updateTenant = async (req, res, next) => {
  try {
    const { id } = req.params
    const updates = req.body

    const tenant = await Tenant.findByPk(id)
    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }

    if (updates.name && updates.name !== tenant.name) {
      const existingTenant = await Tenant.findOne({ where: { name: updates.name } })
      if (existingTenant) {
        throw new ValidationError('Tenant name already exists')
      }
    }

    if (updates.customDomain && updates.customDomain !== tenant.customDomain) {
      const existingDomain = await Tenant.findOne({ where: { customDomain: updates.customDomain } })
      if (existingDomain) {
        throw new ValidationError('Custom domain already in use')
      }
    }

    await tenant.update(updates)

    res.json(tenant)
  } catch (error) {
    next(error)
  }
}

const deleteTenant = async (req, res, next) => {
  try {
    const { id } = req.params

    const tenant = await Tenant.findByPk(id)
    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }

    const users = await User.findAll({ where: { tenantId: id } })

    await tenant.destroy()

    for (const user of users) {
      await emailService.sendTenantDeletionEmail(user)
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

const updateTenantSettings = async (req, res, next) => {
  try {
    const { id } = req.params
    const { settings } = req.body

    const tenant = await Tenant.findByPk(id)
    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }

    const updatedSettings = {
      ...tenant.settings,
      ...settings
    }

    await tenant.update({ settings: updatedSettings })

    res.json(tenant)
  } catch (error) {
    next(error)
  }
}

const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params
    const { plan, billing } = req.body

    const tenant = await Tenant.findByPk(id)
    if (!tenant) {
      throw new NotFoundError('Tenant not found')
    }

    const subscription = {
      ...tenant.subscription,
      plan,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }

    await tenant.update({
      plan,
      subscription,
      billing
    })

    const admin = await User.findOne({
      where: { tenantId: id, role: 'admin' }
    })

    if (admin) {
      await emailService.sendSubscriptionUpdateEmail(admin, plan)
    }

    res.json(tenant)
  } catch (error) {
    next(error)
  }
}

export {
  createTenant,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant,
  updateTenantSettings,
  updateSubscription
} 