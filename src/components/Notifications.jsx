import { useEffect, useMemo, useState } from 'react'
import { fetchNotifications } from '../api/notifications.js'
import { Log } from '../utils/logger.js'
import {
  getNotificationType,
  selectTopN,
  sortAllByPriority,
} from '../utils/priority.js'
import { getNotificationContent } from '../utils/notificationContent.js'
import { getPriorityTier } from '../utils/priorityTier.js'
import NotificationCard from './NotificationCard.jsx'
import NotificationsEmptyState from './NotificationsEmptyState.jsx'
import styles from './glass.module.css'

const DEFAULT_TOP_N = 10

function displayCategory(type) {
  if (type == null || type === '') return 'UNKNOWN'
  const s = String(type).trim()
  return s.toUpperCase()
}

function formatTimestamp(ts) {
  if (ts == null || ts === '') return '—'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return String(ts)
  return d.toLocaleString()
}

/**
 * @param {{
 *   view?: 'top' | 'all'
 *   topN?: number
 *   raw?: unknown[]
 *   loading?: boolean
 *   loadError?: string | null
 * }} props
 */
export default function Notifications({
  view = 'top',
  topN = DEFAULT_TOP_N,
  raw: rawProp,
  loading: loadingProp,
  loadError: loadErrorProp,
}) {
  const controlled = rawProp !== undefined

  const [rawInternal, setRawInternal] = useState([])
  const [loadingInternal, setLoadingInternal] = useState(true)
  const [loadErrorInternal, setLoadErrorInternal] = useState(null)

  const raw = controlled ? rawProp : rawInternal
  const loading = controlled ? Boolean(loadingProp) : loadingInternal
  const loadError = controlled ? loadErrorProp ?? null : loadErrorInternal

  useEffect(() => {
    Log('frontend', 'debug', 'component', `Notifications mounted (view=${view})`)
  }, [view])

  useEffect(() => {
    if (controlled) return

    let cancelled = false

    ;(async () => {
      setLoadingInternal(true)
      setLoadErrorInternal(null)
      try {
        const list = await fetchNotifications()
        if (cancelled) return
        setRawInternal(list)
        Log(
          'frontend',
          'info',
          'component',
          `Notifications: fetched ${list.length} items (view=${view}, topN=${view === 'top' ? topN : 'n/a'})`,
        )
      } catch (e) {
        if (cancelled) return
        const msg = e?.message ?? 'Failed to load notifications'
        setLoadErrorInternal(msg)
        Log('frontend', 'error', 'component', `Notifications fetch error: ${msg}`)
        setRawInternal([])
      } finally {
        if (!cancelled) setLoadingInternal(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [controlled, topN, view])

  const items = useMemo(() => {
    if (view === 'all') return sortAllByPriority(raw)
    return selectTopN(raw, topN)
  }, [raw, view, topN])

  useEffect(() => {
    if (loading) return
    if (view === 'all') {
      Log(
        'frontend',
        'info',
        'state',
        `Data processed: all view — ${items.length} items sorted by priority`,
      )
    } else {
      Log(
        'frontend',
        'info',
        'state',
        `Data processed: top view — ${items.length} of ${raw.length} (heap size ${topN})`,
      )
    }
  }, [loading, items.length, raw.length, topN, view])

  const showRankBadge = view === 'top'

  if (loading) {
    return (
      <div className={styles.loadingWrap} aria-busy="true">
        <div className={styles.spinner} aria-label="Loading notifications" role="status" />
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {loadError ? (
        <div className={`${styles.card} ${styles.cardAlert}`} role="alert">
          <p className={styles.alertText}>
            We couldn&apos;t refresh your feed. You can try again later.
          </p>
        </div>
      ) : null}

      {items.length === 0 ? (
        <NotificationsEmptyState />
      ) : (
        items.map((n, idx) => {
          const t = getNotificationType(n)
          const ts = n?.timestamp ?? n?.Timestamp ?? n?.createdAt ?? n?.time
          const key =
            n?.id ??
            n?.uuid ??
            `${String(t)}-${String(ts)}-${idx}`
          const { title, description } = getNotificationContent(n)
          const tier = getPriorityTier(t)

          return (
            <NotificationCard
              key={key}
              rank={idx + 1}
              showRankBadge={showRankBadge}
              category={displayCategory(t)}
              title={title}
              description={description}
              timestamp={formatTimestamp(ts)}
              tier={tier}
            />
          )
        })
      )}
    </div>
  )
}
