import styles from '../styles/glass.module.css'

export default function NotificationsEmptyState() {
  return (
    <div className={styles.card} role="status">
      <div className={styles.emptyInner}>
        <p className={styles.emptyTitle}>You&apos;re all caught up</p>
        <p className={styles.emptySubtitle}>No new notifications right now</p>
      </div>
    </div>
  )
}
