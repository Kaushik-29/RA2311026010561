import axios from 'axios'

const BASE_URL = 'http://20.207.122.201/evaluation-service'
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJrczkxMTRAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwNDUxMSwiaWF0IjoxNzc3NzAzNjExLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNTYyZjUyNjgtYmQwMC00OGM3LTlmN2ItYjk3NjcwYmJhZDIxIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoia2F1c2hpayBrdW1hciByZWRkeSBzIiwic3ViIjoiYTM2ZDhjODAtOGI4MC00Y2E3LWJlMGMtNzQxOTg3YzJhNGZjIn0sImVtYWlsIjoia3M5MTE0QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoia2F1c2hpayBrdW1hciByZWRkeSBzIiwicm9sbE5vIjoicmEyMzExMDI2MDEwNTYxIiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiYTM2ZDhjODAtOGI4MC00Y2E3LWJlMGMtNzQxOTg3YzJhNGZjIiwiY2xpZW50U2VjcmV0IjoiVFR6UFZtQUN0Sk5KUld5cCJ9.d7-PfVLPKdH8F8Cu8ds4tiOIT04-4LzZYSe5r1kSBeE'

const LOG_ENDPOINT = `${BASE_URL}/logs`

/**
 * Reusable logging middleware — POSTs to remote logs; never blocks UI.
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
