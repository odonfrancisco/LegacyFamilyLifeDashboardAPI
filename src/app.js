// src/app.js
import express from 'express'
import chartsRoutes from './routes/charts.routes.js'
import agentsRoutes from './routes/agents.routes.js'
import authRoutes from './routes/auth.routes.js'
import cors from 'cors'
import { requestLogger, errorHandler } from './middleware/logger.js'

const app = express()

/**
 * Global middleware
 */
app.use(express.json())

app.use(requestLogger)
app.use(errorHandler)

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
)

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

/**
 * Routes
 */
app.use('/auth', authRoutes)
app.use('/charts', chartsRoutes)
app.use('/agents', agentsRoutes)

/**
 * Global error handler (simple for now)
 */
app.use((err, req, res, next) => {
  console.error(err)

  if (err.message.startsWith('Invalid')) {
    return res.status(400).json({ error: err.message })
  }

  res.status(500).json({ error: 'Internal Server Error' })
})

export default app
