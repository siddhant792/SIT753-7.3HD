const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { validateRequest } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { registerSchema, loginSchema } = require('../schemas/auth');


router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);


router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router; 