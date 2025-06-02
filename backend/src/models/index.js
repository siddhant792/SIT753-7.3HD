const User = require('./User')
const Task = require('./Task')
const Tenant = require('./Tenant')
const Notification = require('./Notification')
const Comment = require('./Comment')


User.belongsTo(Tenant, { foreignKey: 'tenantId' })
User.hasMany(Task, { foreignKey: 'creatorId', as: 'createdTasks' })
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' })
User.hasMany(Comment, { foreignKey: 'userId' })


Task.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' })
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' })
Task.belongsTo(Tenant, { foreignKey: 'tenantId' })
Task.hasMany(Comment, { foreignKey: 'taskId' })


Tenant.hasMany(User, { foreignKey: 'tenantId' })
Tenant.hasMany(Task, { foreignKey: 'tenantId' })
Tenant.hasMany(Comment, { foreignKey: 'tenantId' })


Comment.belongsTo(User, { foreignKey: 'userId' })
Comment.belongsTo(Task, { foreignKey: 'taskId' })
Comment.belongsTo(Tenant, { foreignKey: 'tenantId' })
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' })
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' })


Notification.belongsTo(User, { foreignKey: 'userId' })
Notification.belongsTo(Tenant, { foreignKey: 'tenantId' })

module.exports = {
  User,
  Task,
  Tenant,
  Notification,
  Comment
} 