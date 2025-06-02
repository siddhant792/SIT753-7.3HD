const { Sequelize } = require('sequelize')
const logger = require('../utils/logger')

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

const testConnection = async () => {
  try {
    await sequelize.authenticate()
    logger.info('Database connection has been established successfully.')
  } catch (error) {
    logger.error('Unable to connect to the database:', error)
    throw error
  }
}

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true })
    logger.info('Database synchronized successfully.')
  } catch (error) {
    logger.error('Error synchronizing database:', error)
    throw error
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
} 