import { useOutletContext } from 'react-router-dom'
import Notifications from '../../components/notifications/Notifications.jsx'
import styles from '../../components/styles/glass.module.css'

export default function PriorityPage() {
  const { raw, loading, loadError } = useOutletContext()

  return (
    <section className={styles.section} aria-labelledby="priority-heading">
      <h2 id="priority-heading" className={styles.sectionTitle}>
        Top Priority
      </h2>
      <p className={styles.sectionLead}>
        Top 10 important notifications sorted by priority.
      </p>
      <Notifications view="top" topN={10} raw={raw} loading={loading} loadError={loadError} />
    </section>
  )
}
