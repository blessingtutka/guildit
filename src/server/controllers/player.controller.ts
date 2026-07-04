import type { Context } from 'hono';
import { redis } from '@devvit/web/server';
import * as playerService from '../services/player.service';
import { handleError } from '../utils/handle-error';
import { ValidationError } from '../utils/errors';
import type { PlayerClass } from '../../shared/api';

// GET /api/player
export async function getOrCreatePlayer(c: Context) {
  try {
    const body = await c.req.json().catch(() => ({}));
    const userId = (body.userId as string | undefined)?.trim();
    const username =
      (body.username as string | undefined)?.trim() || 'anonymous';
    const snoovatar = (body.snoovatar as string | undefined)?.trim();

    if (!userId) throw new ValidationError('userId is required');

    const player = await playerService.createOrGetPlayer(
      redis,
      userId,
      username,
      snoovatar
    );
    return c.json(player);
  } catch (error) {
    return handleError(c, error);
  }
}

// GET /api/player/:userId
export async function getPlayer(c: Context) {
  try {
    const userId = c.req.param('userId')?.trim();
    if (!userId) throw new ValidationError('userId is required');

    const player = await playerService.getPlayer(redis, userId);
    return c.json(player);
  } catch (error) {
    return handleError(c, error);
  }
}

// POST /api/player/class
export async function setPlayerClass(c: Context) {
  try {
    const body = await c.req.json().catch(() => ({}));
    const userId = (body.userId as string | undefined)?.trim();
    const playerClass = body.playerClass as PlayerClass | undefined;

    if (!userId) throw new ValidationError('userId is required');
    if (!playerClass) throw new ValidationError('playerClass is required');

    const player = await playerService.setPlayerClass(
      redis,
      userId,
      playerClass
    );
    return c.json(player);
  } catch (error) {
    return handleError(c, error);
  }
}

// POST /api/player/points
export async function addPoints(c: Context) {
  try {
    const body = await c.req.json().catch(() => ({}));
    const userId = (body.userId as string | undefined)?.trim();
    const pointsToAdd = body.pointsToAdd as number | undefined;

    if (!userId) throw new ValidationError('userId is required');
    if (typeof pointsToAdd !== 'number') {
      throw new ValidationError('pointsToAdd must be a number');
    }

    const result = await playerService.addPoints(redis, userId, pointsToAdd);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}

// GET /api/player/reclass/preview?userId=xxx
export async function getReclassPreview(c: Context) {
  try {
    const userId = c.req.query('userId')?.trim();
    if (!userId) throw new ValidationError('userId is required');

    const preview = await playerService.getPlayerReclassPreview(redis, userId);
    return c.json(preview);
  } catch (error) {
    return handleError(c, error);
  }
}

// POST /api/player/reclass
export async function reclassPlayer(c: Context) {
  try {
    const body = await c.req.json().catch(() => ({}));
    const userId = (body.userId as string | undefined)?.trim();
    const newClass = body.newClass as PlayerClass | undefined;

    if (!userId) throw new ValidationError('userId is required');
    if (!newClass) throw new ValidationError('newClass is required');

    const result = await playerService.changeClass(redis, userId, newClass);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}
