import { Hono } from 'hono';
import * as notificationController from '../controllers/notification.controller';

export const notification = new Hono();

notification.get('/', notificationController.listNotifications);
notification.delete('/', notificationController.deleteAllNotifications);
notification.post('/:notificationId/read', notificationController.markAsRead);
notification.delete(
  '/:notificationId',
  notificationController.deleteNotification
);
