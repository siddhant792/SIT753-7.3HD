import express from 'express'
import { createTask, getTasks, getTask, updateTask, deleteTask, addComment } from '../controllers/tasks.js'
import { validateRequest } from '../middleware/validation.js'
import { authenticate } from '../middleware/auth.js'
import { taskSchema, commentSchema } from '../schemas/tasks.js'

const router = express.Router()

router.use(authenticate)

router.post('/', validateRequest(taskSchema), createTask)
router.get('/', getTasks)
router.get('/:id', getTask)
router.put('/:id', validateRequest(taskSchema), updateTask)
router.delete('/:id', deleteTask)

router.post('/:id/comments', validateRequest(commentSchema), addComment)

export default router 