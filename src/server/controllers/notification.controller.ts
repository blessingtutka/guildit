import type { Context } from 'hono';
import { redis } from '@devvit/web/server';
import * as notificationService from '../services/notification.service';
import { handleError } from '../utils/handle-error';
import { ValidationError } from '../utils/errors';

// GET /api/notifications?userId=xxx&limit=20
export async function listNotifications(c: Context) {
  try {
    const userId = c.req.query('userId')?.trim();
    const limitParam = c.req.query('limit');
    const limit = limitParam ? Number.parseInt(limitParam) : 20;

    if (!userId) throw new ValidationError('userId is required');

    const notifications = await notificationService.listNotifications(
      redis,
      userId,
      limit
    );
    return c.json({ notifications });
  } catch (error) {
    return handleError(c, error);
  }
}

// POST /api/notifications/:notificationId/read
export async function markAsRead(c: Context) {
  try {
    const notificationId = c.req.param('notificationId')?.trim();
    const body = await c.req.json().catch(() => ({}));
    const userId = (body.userId as string | undefined)?.trim();

    if (!notificationId)
      throw new ValidationError('notificationId is required');
    if (!userId) throw new ValidationError('userId is required');

    const notification = await notificationService.markAsRead(
      redis,
      userId,
      notificationId
    );
    return c.json(notification);
  } catch (error) {
    return handleError(c, error);
  }
}

// DELETE /api/notifications/:notificationId?userId=xxx
export async function deleteNotification(c: Context) {
  try {
    const notificationId = c.req.param('notificationId')?.trim();
    const userId = c.req.query('userId')?.trim();

    if (!notificationId)
      throw new ValidationError('notificationId is required');
    if (!userId) throw new ValidationError('userId is required');

    const result = await notificationService.deleteNotification(
      redis,
      userId,
      notificationId
    );
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}

// DELETE /api/notifications?userId=xxx ── clear all
export async function deleteAllNotifications(c: Context) {
  try {
    const userId = c.req.query('userId')?.trim();
    if (!userId) throw new ValidationError('userId is required');

    const result = await notificationService.deleteAllNotifications(
      redis,
      userId
    );
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}
