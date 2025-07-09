import express from 'express';
import validate from '../../middlewares/validate.js';
import * as notificationValidation from '../../validations/notification.validation.js';
import * as notificationController from '../../controllers/notification.controller.js';
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

router
  .route('/')
  .get(auth(), validate(notificationValidation.getNotifications), notificationController.getNotifications)
  .post(auth(), validate(notificationValidation.createNotification), notificationController.createNotification);

router
  .route('/:notificationId')
  .get(auth(), validate(notificationValidation.getNotification), notificationController.getNotification)
  .patch(auth(), validate(notificationValidation.updateNotification), notificationController.updateNotification)
  .delete(auth(), validate(notificationValidation.deleteNotification), notificationController.deleteNotification);

router
  .route('/:notificationId/mark-read')
  .patch(auth(), validate(notificationValidation.markAsRead), notificationController.markAsRead);

router
  .route('/mark-all-read')
  .patch(auth(), notificationController.markAllAsRead);

router
  .route('/unread-count')
  .get(auth(), notificationController.getUnreadCount);

export default router;
