import axios from 'axios'
import { Log } from '../utils/logger.js'

const BASE_URL = 'http://20.207.122.201/evaluation-service'
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJrczkxMTRAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwNDUxMSwiaWF0IjoxNzc3NzAzNjExLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNTYyZjUyNjgtYmQwMC00OGM3LTlmN2ItYjk3NjcwYmJhZDIxIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoia2F1c2hpayBrdW1hciByZWRkeSBzIiwic3ViIjoiYTM2ZDhjODAtOGI4MC00Y2E3LWJlMGMtNzQxOTg3YzJhNGZjIn0sImVtYWlsIjoia3M5MTE0QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoia2F1c2hpayBrdW1hciByZWRkeSBzIiwicm9sbE5vIjoicmEyMzExMDI2MDEwNTYxIiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiYTM2ZDhjODAtOGI4MC00Y2E3LWJlMGMtNzQxOTg3YzJhNGZjIiwiY2xpZW50U2VjcmV0IjoiVFR6UFZtQUN0Sk5KUld5cCJ9.d7-PfVLPKdH8F8Cu8ds4tiOIT04-4LzZYSe5r1kSBeE'

const NOTIFICATIONS_URL = `${BASE_URL}/notifications`

function normalizeList(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.notifications)) return data.notifications
  if (data && Array.isArray(data.data)) return data.data
  if (data && Array.isArray(data.items)) return data.items
  return []
}

/**
 * @returns {Promise<object[]>}
 */
export async function fetchNotifications() {
  Log('frontend', 'info', 'api', 'GET /notifications started')

  try {
    const response = await axios.get(NOTIFICATIONS_URL, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/json',
      },
      timeout: 30000,
    })

    const list = normalizeList(response.data)
    Log(
      'frontend',
      'info',
      'api',
      `GET /notifications success; received ${list.length} raw items`,
    )
    return list
  } catch (err) {
    const msg =
      err?.response?.status != null
        ? `GET /notifications failed: HTTP ${err.response.status}`
        : `GET /notifications failed: ${err?.message ?? 'unknown error'}`
    Log('frontend', 'error', 'api', msg)
    return []
  }
}
