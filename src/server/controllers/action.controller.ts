import type { Context } from 'hono';
import { redis } from '@devvit/web/server';
import * as actionService from '../services/action.service';
import { handleError } from '../utils/handle-error';
import { ValidationError } from '../utils/errors';
import type { ActionType } from '../../shared/api';

//  POST /api/action - perform a class action
export async function logAction(c: Context) {
  try {
    const body = await c.req.json().catch(() => ({}));
    const userId = (body.userId as string | undefined)?.trim();
    const action = body.action as ActionType | undefined;

    if (!userId) throw new ValidationError('userId is required');
    if (!action) throw new ValidationError('action is required');

    const result = await actionService.logAction(redis, userId, action);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}

// GET /api/action/status?userId=xxx&action=xxx
export async function getActionStatus(c: Context) {
  try {
    const userId = c.req.query('userId')?.trim();
    const action = c.req.query('action') as ActionType | undefined;

    if (!userId) throw new ValidationError('userId is required');
    if (!action) throw new ValidationError('action is required');

    const status = await actionService.getActionStatus(redis, userId, action);
    return c.json(status);
  } catch (error) {
    return handleError(c, error);
  }
}
