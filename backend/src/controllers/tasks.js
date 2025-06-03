import { Task, User, Comment } from '../models/index.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'
import websocketService from '../services/websocket.js'
import emailService from '../services/email.js'
import { Op } from 'sequelize'

const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, assigneeId, tags } = req.body
    const { tenantId } = req.user

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      assigneeId,
      tags,
      creatorId: req.user.id,
      tenantId
    })

    if (assigneeId) {
      const assignee = await User.findByPk(assigneeId)
      if (assignee) {
        await emailService.sendTaskAssignmentEmail(assignee, task)
        websocketService.emitToUser(assigneeId, 'task:assigned', task)
      }
    }

    websocketService.emitToTenant(tenantId, 'task:created', task)

    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
}

const getTasks = async (req, res, next) => {
  try {
    const { tenantId } = req.user
    const { status, priority, assigneeId, search } = req.query

    const where = { tenantId }
    if (status) where.status = status
    if (priority) where.priority = priority
    if (assigneeId) where.assigneeId = assigneeId
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ]
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.json(tasks)
  } catch (error) {
    next(error)
  }
}

const getTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const { tenantId } = req.user

    const task = await Task.findOne({
      where: { id, tenantId },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: Comment,
          include: [{ model: User, attributes: ['id', 'name', 'email'] }]
        }
      ]
    })

    if (!task) {
      throw new NotFoundError('Task not found')
    }

    res.json(task)
  } catch (error) {
    next(error)
  }
}

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const { tenantId } = req.user
    const updates = req.body

    const task = await Task.findOne({
      where: { id, tenantId }
    })

    if (!task) {
      throw new NotFoundError('Task not found')
    }

    const oldAssigneeId = task.assigneeId
    const newAssigneeId = updates.assigneeId

    await task.update(updates)

    if (newAssigneeId && newAssigneeId !== oldAssigneeId) {
      const assignee = await User.findByPk(newAssigneeId)
      if (assignee) {
        await emailService.sendTaskAssignmentEmail(assignee, task)
        websocketService.emitToUser(newAssigneeId, 'task:assigned', task)
      }
    }

    websocketService.emitToTenant(tenantId, 'task:updated', task)

    res.json(task)
  } catch (error) {
    next(error)
  }
}

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const { tenantId } = req.user

    const task = await Task.findOne({
      where: { id, tenantId }
    })

    if (!task) {
      throw new NotFoundError('Task not found')
    }

    await task.destroy()

    websocketService.emitToTenant(tenantId, 'task:deleted', id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

const addComment = async (req, res, next) => {
  try {
    const { id } = req.params
    const { content, parentId } = req.body
    const { tenantId, id: userId } = req.user

    const task = await Task.findOne({
      where: { id, tenantId }
    })

    if (!task) {
      throw new NotFoundError('Task not found')
    }

    const comment = await Comment.create({
      content,
      taskId: id,
      userId,
      tenantId,
      parentId
    })

    if (task.assigneeId && task.assigneeId !== userId) {
      websocketService.emitToUser(task.assigneeId, 'comment:created', {
        taskId: id,
        comment
      })
    }
    if (task.creatorId !== userId) {
      websocketService.emitToUser(task.creatorId, 'comment:created', {
        taskId: id,
        comment
      })
    }

    res.status(201).json(comment)
  } catch (error) {
    next(error)
  }
}

export {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment
} 