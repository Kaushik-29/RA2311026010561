/**
 * Frontend logging utility.
 *
 * Uses the same API as logging_middleware/logger.js but is self-contained
 * so Vite can resolve it without reaching outside the project root.
 *
 * The shared logging_middleware package contains the canonical implementation.
 * This file mirrors its createLogger() output for the frontend stack.
 */
import axios from 'axios'

const BASE_URL = 'http://20.207.122.201/evaluation-service'
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJrczkxMTRAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwNjMwNCwiaWF0IjoxNzc3NzA1NDA0LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiYTczZWRlZWItMDIzOC00M2Q2LTgwYWQtOWUwZjI1Yzk5MTE0IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoia2F1c2hpayBrdW1hciByZWRkeSBzIiwic3ViIjoiYTM2ZDhjODAtOGI4MC00Y2E3LWJlMGMtNzQxOTg3YzJhNGZjIn0sImVtYWlsIjoia3M5MTE0QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoia2F1c2hpayBrdW1hciByZWRkeSBzIiwicm9sbE5vIjoicmEyMzExMDI2MDEwNTYxIiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiYTM2ZDhjODAtOGI4MC00Y2E3LWJlMGMtNzQxOTg3YzJhNGZjIiwiY2xpZW50U2VjcmV0IjoiVFR6UFZtQUN0Sk5KUld5cCJ9._Ccr_WhMkY0PPxkhI3K_qH9_XRbe9acgIhEde3uOW8o'

const LOG_ENDPOINT = `${BASE_URL}/logs`

/**
 * Reusable logging function — POSTs to remote logs; never blocks UI.
 * @param {'frontend'} stack
 * @param {'debug'|'info'|'warn'|'error'|'fatal'} level
 * @param {'api'|'component'|'page'|'state'|'utils'} pkg
 * @param {string} message
 */
export function Log(stack, level, pkg, message) {
  const payload = {
    stack,
    level,
    package: pkg,
    message: String(message),
    clientTimestamp: new Date().toISOString(),
  }

  axios
    .post(LOG_ENDPOINT, payload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    })
    .catch(() => {})
}
