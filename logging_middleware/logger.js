import axios from 'axios'

/**
 * Creates a reusable Log function bound to a specific API endpoint.
 *
 * @param {string} baseUrl  The evaluation-service base URL
 * @param {string} token    Bearer token for authentication
 * @returns {function(string, string, string, string): void}
 *
 * @example
 *   import { createLogger } from 'logging-middleware'
 *
 *   const Log = createLogger('http://example.com/api', 'my-token')
 *   Log('frontend', 'info', 'page', 'App mounted')
 */
export function createLogger(baseUrl, token) {
  const endpoint = `${baseUrl}/logs`

  /**
   * Fire-and-forget log POST — never blocks the caller.
   *
   * @param {'frontend'|'backend'} stack   Which stack originated the log
   * @param {'debug'|'info'|'warn'|'error'|'fatal'} level  Severity level
   * @param {string} pkg    Logical package / area (e.g. 'api', 'component')
   * @param {string} message  Human-readable log message
   */
  return function Log(stack, level, pkg, message) {
    const payload = {
      stack,
      level,
      package: pkg,
      message: String(message),
      clientTimestamp: new Date().toISOString(),
    }

    axios
      .post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      })
      .catch(() => {})
  }
}

/**
 * Express/Connect-compatible logging middleware.
 * Logs each incoming request with method, URL, and status code.
 *
 * @param {function} logFn  A Log function created via createLogger()
 * @returns {function} Express middleware
 *
 * @example
 *   import { createLogger, requestLogger } from 'logging-middleware'
 *
 *   const Log = createLogger(BASE_URL, TOKEN)
 *   app.use(requestLogger(Log))
 */
export function requestLogger(logFn) {
  return (req, res, next) => {
    const start = Date.now()

    res.on('finish', () => {
      const duration = Date.now() - start
      logFn(
        'backend',
        res.statusCode >= 400 ? 'error' : 'info',
        'http',
        `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
      )
    })

    next()
  }
}
