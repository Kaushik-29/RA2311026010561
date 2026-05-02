import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { fetchNotifications } from '../api/notifications.js'
import { Log } from '../utils/logger.js'
import NotificationTabs from './NotificationTabs.jsx'
import styles from './glass.module.css'

export default function AppLayout() {
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    Log('frontend', 'debug', 'page', 'AppLayout mounted; loading notifications once')

    let cancelled = false

    ;(async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const list = await fetchNotifications()
        if (!cancelled) setRaw(list)
      } catch (e) {
        if (!cancelled) {
          const msg = e?.message ?? 'Failed to load notifications'
          setLoadError(msg)
          Log('frontend', 'error', 'page', `AppLayout fetch error: ${msg}`)
          setRaw([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <h1 className={styles.pageTitle}>Notifications</h1>

      <NotificationTabs />

      <Outlet context={{ raw, loading, loadError }} />
    </>
  )
}
