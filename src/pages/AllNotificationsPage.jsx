import { useOutletContext } from 'react-router-dom'
import Notifications from '../components/Notifications.jsx'
import styles from '../components/glass.module.css'

export default function AllNotificationsPage() {
  const { raw, loading, loadError } = useOutletContext()

  return (
    <section className={styles.section} aria-labelledby="all-heading">
      <h2 id="all-heading" className={styles.sectionTitle}>
        All Notifications
      </h2>
      <p className={styles.sectionLead}>
        Everything in your inbox, ordered with the most important items first.
      </p>
      <Notifications view="all" raw={raw} loading={loading} loadError={loadError} />
    </section>
  )
}
