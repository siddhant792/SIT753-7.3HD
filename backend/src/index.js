require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const compression = require('compression')
const path = require('path')
const { sequelize, testConnection, syncDatabase } = require('./config/database')
const logger = require('./utils/logger')
const errorHandler = require('./middleware/error')
const { Sequelize } = require('sequelize')
const client = require('prom-client')


const authRoutes = require('./routes/auth')
const taskRoutes = require('./routes/tasks')
const tenantRoutes = require('./routes/tenants')


const app = express()


app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))


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

app.use(morgan('combined', { stream: logger.stream }))
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/uploads', express.static(path.join(__dirname, '../uploads')))


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


app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/tenants', tenantRoutes)


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


app.use(errorHandler)


const PORT = process.env.PORT || 3001

async function startServer() {
  try {
    
    await testConnection()
    logger.info('Database connection successful')

    
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase()
      logger.info('Database synchronized')
    }

    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}


process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection:', error)
  process.exit(1)
})


process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error)
  process.exit(1)
})

startServer() 