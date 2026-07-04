import type { RedisClient } from '@devvit/web/server';
import type { ActionType, Player } from '../../shared/api';
import { ACTION_DAILY_CAPS } from '../../shared/api';
import { calculateActionPoints } from '../utils/points-calculator';
import { NotFoundError, RateLimitError } from '../utils/errors';
import { addPoints } from './player.service';

export interface LogActionResult {
  player: Player & { level: number };
  pointsEarned: number;
  leveledUp: boolean;
  remainingToday: number;
}

// log action information
export async function logAction(
  redis: RedisClient,
  userId: string,
  action: ActionType
): Promise<LogActionResult> {
  const player = await redis.hGetAll(`player:${userId}`);
  if (!player || !player.userId) {
    throw new NotFoundError(`Player ${userId} not found`);
  }

  const today = new Date().toISOString().split('T')[0];
  const capKey = `actioncount:${userId}:${action}:${today}`;
  const cap = ACTION_DAILY_CAPS[action];

  const doneToday = Number.parseInt((await redis.get(capKey)) || '0');

  if (doneToday >= cap) {
    throw new RateLimitError(
      `Daily limit reached for ${action} (${cap}× per day) — resets at midnight UTC`
    );
  }

  const points = calculateActionPoints(action);

  await redis.set(capKey, String(doneToday + 1));
  if (doneToday === 0) {
    await redis.expire(capKey, 86400);
  }

  const result = await addPoints(redis, userId, points);

  return {
    player: result.player,
    pointsEarned: points,
    leveledUp: result.leveledUp,
    remainingToday: cap - (doneToday + 1),
  };
}

// get Action status for a player
export async function getActionStatus(
  redis: RedisClient,
  userId: string,
  action: ActionType
): Promise<{ cap: number; usedToday: number; remaining: number }> {
  const today = new Date().toISOString().split('T')[0];
  const capKey = `actioncount:${userId}:${action}:${today}`;
  const cap = ACTION_DAILY_CAPS[action];
  const usedToday = Number.parseInt((await redis.get(capKey)) || '0');

  return { cap, usedToday, remaining: Math.max(cap - usedToday, 0) };
}
