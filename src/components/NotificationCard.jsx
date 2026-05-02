import styles from './glass.module.css'

/**
 * @typedef {'high' | 'medium' | 'low'} PriorityTier
 */

/**
 * Glass notification card.
 * @param {{
 *   rank: number
 *   showRankBadge?: boolean
 *   category: string
 *   title: string
 *   description?: string | null
 *   timestamp: string
 *   tier: PriorityTier
 * }} props
 */
export default function NotificationCard({
  rank,
  showRankBadge = true,
  category,
  title,
  description,
  timestamp,
  tier,
}) {
  const cardClass = [styles.card, tier === 'high' ? styles.cardHigh : ''].filter(Boolean).join(' ')

  return (
    <article className={cardClass}>
      <div className={styles.rowTop}>
        {showRankBadge ? (
          <span className={styles.badge}>#{rank}</span>
        ) : null}
        <div className={styles.rowMeta}>
          {tier === 'medium' ? <span className={styles.dot} aria-hidden /> : null}
          <span className={styles.category}>{category}</span>
        </div>
      </div>

      <h3 className={styles.title}>{title}</h3>

      {description && description !== title ? (
        <p className={styles.description}>{description}</p>
      ) : null}

      <div className={styles.rowBottom}>
        <span className={styles.timestamp}>{timestamp}</span>
      </div>
    </article>
  )
}
