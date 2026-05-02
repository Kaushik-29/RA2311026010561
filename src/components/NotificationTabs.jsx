import { Link, useLocation } from 'react-router-dom'
import styles from './glass.module.css'

/**
 * Minimal routed tabs: Top Priority | All Notifications
 */
export default function NotificationTabs() {
  const { pathname } = useLocation()
  const isAll = pathname.startsWith('/all')

  return (
    <nav className={styles.tabsNav} aria-label="Notification views">
      <Link
        to="/priority"
        className={`${styles.tab} ${!isAll ? styles.tabActive : ''}`}
      >
        Top Priority
      </Link>
      <Link to="/all" className={`${styles.tab} ${isAll ? styles.tabActive : ''}`}>
        All Notifications
      </Link>
    </nav>
  )
}
