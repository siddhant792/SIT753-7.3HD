import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import compression from 'compression'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { testConnection, syncDatabase } from './config/database.js'
import logger from './utils/logger.js'
import errorHandler from './middleware/error.js'
import client from 'prom-client'

import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import tenantRoutes from './routes/tenants.js'

dotenv.config()

const __dirname = process.cwd();

const app = express()

// Basic middleware
app.use(morgan('combined', { stream: logger.stream }))
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true
}))

// Metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics
collectDefaultMetrics({ timeout: 5000 })

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
})

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
})

// Static files
app.use('/uploads', express.static(join(__dirname, '../uploads')))

// Request metrics middleware
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    const route = req.route ? req.route.path : req.path
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration / 1000)
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc()
  })
  next()
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/tenants', tenantRoutes)

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType)
  res.end(await client.register.metrics())
})

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Not Found - ${req.originalUrl}`
  })
})

// Error handler
app.use(errorHandler)

const PORT = process.env.PORT || 3001

async function startServer() {
  try {
    // Test database connection
    await testConnection()
    logger.info('Database connection successful')

    // Sync database in development
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase()
      logger.info('Database synchronized')
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Error handling for unhandled rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection:', error)
  process.exit(1)
})

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error)
  process.exit(1)
})

// startServer()
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app; 