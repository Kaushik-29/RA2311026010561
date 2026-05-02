import * as notificationsService from '../services/notificationsService.js'

/**
 * GET /api/notifications
 */
export async function getAllNotifications(req, res) {
  try {
    const notifications = await notificationsService.getAll()
    res.json({ notifications })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/notifications/:id
 */
export async function getNotificationById(req, res) {
  try {
    const notification = await notificationsService.getById(req.params.id)
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }
    res.json({ notification })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
