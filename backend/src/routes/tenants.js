import express from 'express'
import { createTenant, getTenants, getTenant, updateTenant, deleteTenant, updateTenantSettings, updateSubscription } from '../controllers/tenants.js'
import { validateRequest } from '../middleware/validation.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { tenantSchema, settingsSchema, subscriptionSchema } from '../schemas/tenants.js'

const router = express.Router()

router.use(authenticate)

router.post('/', authorize(['admin']), validateRequest(tenantSchema), createTenant)
router.get('/', authorize(['admin']), getTenants)
router.get('/:id', authorize(['admin']), getTenant)
router.put('/:id', authorize(['admin']), validateRequest(tenantSchema), updateTenant)
router.delete('/:id', authorize(['admin']), deleteTenant)

router.put('/:id/settings', authorize(['admin']), validateRequest(settingsSchema), updateTenantSettings)
router.put('/:id/subscription', authorize(['admin']), validateRequest(subscriptionSchema), updateSubscription)

export default router 