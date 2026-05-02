/**
 * Derive title / description for card layout from API-shaped items.
 * @param {object} n
 */
export function getNotificationContent(n) {
  const titleField = n?.title ?? n?.Title ?? n?.subject ?? n?.Subject
  const descField = n?.description ?? n?.Description ?? n?.subtitle
  const body =
    n?.message ?? n?.Message ?? n?.body ?? ''

  if (titleField) {
    return {
      title: String(titleField).trim() || '—',
      description: descField ? String(descField).trim() : null,
    }
  }

  const text = String(body ?? '').trim() || '—'
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  if (lines.length >= 2) {
    return {
      title: lines[0],
      description: lines.slice(1).join(' '),
    }
  }

  if (text.length > 140) {
    const cut = text.slice(0, 140).trim()
    return {
      title: `${cut}…`,
      description: text,
    }
  }

  return { title: text, description: null }
}

export function isUnreadNotification(n) {
  if (!n || typeof n !== 'object') return false
  if (n.unread === true) return true
  if (n.read === false) return true
  if (n.isRead === false) return true
  return false
}
