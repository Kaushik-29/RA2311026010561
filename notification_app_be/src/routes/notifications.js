import { Router } from 'express'
import {
  getAllNotifications,
  getNotificationById,
} from '../controllers/notificationsController.js'

const router = Router()

router.get('/', getAllNotifications)
router.get('/:id', getNotificationById)

export default router
