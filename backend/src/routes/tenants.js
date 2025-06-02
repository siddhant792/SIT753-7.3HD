const express = require('express');
const router = express.Router();
const tenantsController = require('../controllers/tenants');
const { validateRequest } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantSchema, settingsSchema, subscriptionSchema } = require('../schemas/tenants');


router.use(authenticate);


router.post('/', authorize(['admin']), validateRequest(tenantSchema), tenantsController.createTenant);
router.get('/', authorize(['admin']), tenantsController.getTenants);
router.get('/:id', authorize(['admin']), tenantsController.getTenant);
router.put('/:id', authorize(['admin']), validateRequest(tenantSchema), tenantsController.updateTenant);
router.delete('/:id', authorize(['admin']), tenantsController.deleteTenant);


router.put('/:id/settings', authorize(['admin']), validateRequest(settingsSchema), tenantsController.updateTenantSettings);
router.put('/:id/subscription', authorize(['admin']), validateRequest(subscriptionSchema), tenantsController.updateSubscription);

module.exports = router; 