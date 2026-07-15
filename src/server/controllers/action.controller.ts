import type { Context } from 'hono';
import { redis } from '@devvit/web/server';
import * as actionService from '../services/action.service';
import { handleError } from '../utils/handle-error';
import { ValidationError } from '../utils/errors';
import type { ActionType, PlayerClass } from '../../shared/api';
import * as challengeService from '../core/challenge.core';

// POST /api/action
export async function logAction(c: Context) {
  try {
    const body = await c.req.json().catch(() => ({}));
    const userId = (body.userId as string | undefined)?.trim();
    const action = body.action as ActionType | undefined;
    const challengeId = (body.challengeId as string | undefined)?.trim();
    const chosenOptionId = (body.chosenOptionId as string | undefined)?.trim();

    if (!userId) throw new ValidationError('userId is required');
    if (!action) throw new ValidationError('action is required');

    const challenge =
      challengeId && chosenOptionId
        ? { challengeId, chosenOptionId }
        : undefined;

    const result = await actionService.logAction(redis, userId, action, {
      challenge,
    });
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

// GET /api/action/status/class?userId=xxx&playerClass=xxx
export async function getClassActionStatus(c: Context) {
  try {
    const userId = c.req.query('userId')?.trim();
    const playerClass = c.req.query('playerClass') as PlayerClass | undefined;

    if (!userId) throw new ValidationError('userId is required');
    if (!playerClass) throw new ValidationError('playerClass is required');

    const statuses = await actionService.getClassActionStatus(
      redis,
      userId,
      playerClass
    );
    return c.json({ statuses });
  } catch (error) {
    return handleError(c, error);
  }
}

// GET /api/action/challenge?playerClass=RANGER
export async function getChallenge(c: Context) {
  try {
    const playerClass = c.req.query('playerClass') as PlayerClass | undefined;
    if (!playerClass) throw new ValidationError('playerClass is required');

    const challenge = challengeService.getRandomChallenge(playerClass);
    return c.json(challenge);
  } catch (error) {
    return handleError(c, error);
  }
}
