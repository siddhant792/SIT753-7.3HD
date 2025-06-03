import { Model, DataTypes } from 'sequelize'
import bcrypt from 'bcrypt'
import { sequelize } from '../config/database.js'

class User extends Model {
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      theme: 'light',
      language: 'en'
    }
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'User',
  timestamps: true,
  hooks: {
    beforeValidate: (user) => {
      if (!user.role) {
        user.role = 'user'
      }
    },
    beforeCreate: (user) => {
      if (user.role !== 'admin' && !user.tenantId) {
        throw new Error('Tenant ID is required for non-admin users')
      }
    },
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
      }
    }
  }
})

export default User 