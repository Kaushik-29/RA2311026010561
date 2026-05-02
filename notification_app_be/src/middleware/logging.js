import { createLogger, requestLogger } from '../../../logging_middleware/logger.js'

const BASE_URL = process.env.LOG_BASE_URL || 'http://20.207.122.201/evaluation-service'
const TOKEN = process.env.LOG_TOKEN || ''

/**
 * Pre-configured backend logger.
 */
export const Log = createLogger(BASE_URL, TOKEN)

/**
 * Express middleware that logs every request.
 */
export const httpLogger = requestLogger(Log)
