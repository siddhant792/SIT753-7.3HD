const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

class Comment extends Model {}

Comment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tasks',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tenants',
      key: 'id'
    }
  },
  parentId: {
    type: DataTypes.UUID,
    references: {
      model: 'Comments',
      key: 'id'
    }
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  mentions: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Comment',
  timestamps: true,
  indexes: [
    {
      fields: ['taskId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['tenantId']
    },
    {
      fields: ['parentId']
    },
    {
      fields: ['createdAt']
    }
  ]
})

module.exports = Comment 