import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { createLogger, requestLogger } from '../../logging_middleware/logger.js'
import notificationsRouter from './routes/notifications.js'

const PORT = process.env.PORT || 3001
const BASE_URL = process.env.LOG_BASE_URL || 'http://20.207.122.201/evaluation-service'
const TOKEN = process.env.LOG_TOKEN || ''

const Log = createLogger(BASE_URL, TOKEN)
const app = express()

// ── Middleware ───────────────────────────────────────────────
app.use(cors())
app.use(express.json())
app.use(requestLogger(Log))

// ── Routes ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/notifications', notificationsRouter)

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  Log('backend', 'info', 'startup', `Server listening on port ${PORT}`)
  console.log(`🚀 notification_app_be running at http://localhost:${PORT}`)
})
