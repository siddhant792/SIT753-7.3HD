const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

class Tenant extends Model {}

Tenant.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  plan: {
    type: DataTypes.ENUM('free', 'pro', 'enterprise'),
    defaultValue: 'free'
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      userLimit: 10,
      theme: {
        primaryColor: '#4A90E2',
        secondaryColor: '#50E3C2'
      }
    }
  },
  customDomain: {
    type: DataTypes.STRING,
    unique: true
  },
  subscription: {
    type: DataTypes.JSONB,
    defaultValue: {
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
    }
  },
  billing: {
    type: DataTypes.JSONB,
    defaultValue: {
      companyName: null,
      address: null,
      taxId: null,
      paymentMethod: null
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Tenant',
  timestamps: true,
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['plan']
    },
    {
      fields: ['isActive']
    }
  ]
})

module.exports = Tenant 