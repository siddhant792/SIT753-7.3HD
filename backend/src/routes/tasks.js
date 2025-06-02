const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks');
const { validateRequest } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { taskSchema, commentSchema } = require('../schemas/tasks');


router.use(authenticate);


router.post('/', validateRequest(taskSchema), tasksController.createTask);
router.get('/', tasksController.getTasks);
router.get('/:id', tasksController.getTask);
router.put('/:id', validateRequest(taskSchema), tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);


router.post('/:id/comments', validateRequest(commentSchema), tasksController.addComment);

module.exports = router; 