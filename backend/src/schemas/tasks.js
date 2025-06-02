const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().allow('').max(1000),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  status: Joi.string().valid('todo', 'in_progress', 'review', 'done').default('todo'),
  dueDate: Joi.date().iso().min('now').allow(null),
  assigneeId: Joi.string().uuid().allow(null),
  tags: Joi.array().items(Joi.string()).max(10),
  parentTaskId: Joi.string().uuid().allow(null),
  estimatedHours: Joi.number().min(0).max(1000).allow(null),
  actualHours: Joi.number().min(0).max(1000).allow(null)
}).required();

const commentSchema = Joi.object({
  content: Joi.string().required().min(1).max(1000),
  parentId: Joi.string().uuid().allow(null),
  attachments: Joi.array().items(Joi.string()).max(5)
}).required();

module.exports = {
  taskSchema,
  commentSchema
}; 