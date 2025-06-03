import express from 'express'
import { register, login, logout, getCurrentUser } from '../controllers/auth.js'
import { validateRequest } from '../middleware/validation.js'
import { authenticate } from '../middleware/auth.js'
import { registerSchema, loginSchema } from '../schemas/auth.js'

const router = express.Router()

router.post('/register', validateRequest(registerSchema), register)
router.post('/login', validateRequest(loginSchema), login)
router.post('/logout', logout)

router.get('/me', authenticate, getCurrentUser)

export default router 