import { Sequelize } from 'sequelize'
import logger from '../utils/logger.js'
import dotenv from 'dotenv'

// Ensure environment variables are loaded
dotenv.config()

// Debug: Log the DATABASE_URL (with password masked)
const dbUrl = process.env.DATABASE_URL || 'postgres://localhost:5432/testdb'
if (!dbUrl) {
  logger.error('DATABASE_URL is not defined in environment variables')
  throw new Error('DATABASE_URL is not defined in environment variables')
}

logger.info('Database URL format:', dbUrl.replace(/:[^:@]+@/, ':****@'))

const sequelize = new Sequelize(dbUrl, {
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

export {
  sequelize,
  testConnection,
  syncDatabase
} 