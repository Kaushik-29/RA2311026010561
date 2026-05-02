import styles from '../styles/glass.module.css'

/**
 * Full-viewport gradient shell + centered content column.
 * @param {{ children: import('react').ReactNode }} props
 */
export default function GlassLayout({ children }) {
  return (
    <main className={styles.shell}>
      <div className={styles.container}>{children}</div>
    </main>
  )
}
