import type { RedisClient } from '@devvit/web/server';
import type { ActionType, PlayerClass, Player } from '../../shared/api';
import {
  ACTION_DAILY_CAPS,
  ACTION_BASE_POINTS,
  CLASS_ACTIONS,
  SYSTEM_VERIFIED_ACTIONS,
} from '../../shared/api';
import {
  NotFoundError,
  ConflictError,
  RateLimitError,
  ValidationError,
} from '../utils/errors';
import { addPoints } from './player.service';
import { submitAnswer } from '../core/challenge.core';

export interface ActionStatus {
  cap: number;
  usedToday: number;
  remaining: number;
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0]!;
}

function actionCountKey(
  userId: string,
  action: ActionType,
  day: string
): string {
  return `actioncount:${userId}:${action}:${day}`;
}

// getActionStatus
export async function getActionStatus(
  redis: RedisClient,
  userId: string,
  action: ActionType
): Promise<ActionStatus> {
  const day = todayKey();
  const cap = ACTION_DAILY_CAPS[action];
  const used = Number.parseInt(
    (await redis.get(actionCountKey(userId, action, day))) || '0'
  );

  return { cap, usedToday: used, remaining: Math.max(cap - used, 0) };
}

//  getClassActionStatus
export async function getClassActionStatus(
  redis: RedisClient,
  userId: string,
  playerClass: PlayerClass
): Promise<Record<ActionType, ActionStatus>> {
  const actions = CLASS_ACTIONS[playerClass];
  const entries = await Promise.all(
    actions.map(
      async (action) =>
        [action, await getActionStatus(redis, userId, action)] as const
    )
  );
  return Object.fromEntries(entries) as Record<ActionType, ActionStatus>;
}

// logAction
export interface LogActionResult {
  player: Player & { level: number };
  action: ActionType;
  pointsEarned: number;
  leveledUp: boolean;
  remainingToday: number;
  challengeResult?: { correct: boolean; explanation?: string };
}

export async function logAction(
  redis: RedisClient,
  userId: string,
  action: ActionType,
  options: {
    systemVerified?: boolean;
    challenge?: { challengeId: string; chosenOptionId: string };
  } = {}
): Promise<LogActionResult> {
  const isSystemAction = SYSTEM_VERIFIED_ACTIONS.includes(action);

  if (isSystemAction && !options.systemVerified) {
    throw new ConflictError(
      `${action} is awarded automatically once verified — it can't be triggered manually`
    );
  }

  if (!isSystemAction && !options.challenge) {
    throw new ValidationError(
      `${action} requires completing a challenge first — call GET /api/challenge, then submit the answer here`
    );
  }

  const player = await redis.hGetAll(`player:${userId}`);
  if (!player || !player.userId) {
    throw new NotFoundError(`Player ${userId} not found`);
  }
  if (!player.class) {
    throw new ConflictError('Player has no class yet');
  }

  const playerClass = player.class as PlayerClass;
  if (!CLASS_ACTIONS[playerClass].includes(action)) {
    throw new ConflictError(
      `${action} does not belong to class ${playerClass}`
    );
  }

  const day = todayKey();
  const key = actionCountKey(userId, action, day);
  const cap = ACTION_DAILY_CAPS[action];
  const used = Number.parseInt((await redis.get(key)) || '0');

  if (used >= cap) {
    throw new RateLimitError(
      `Daily limit reached for ${action} (${cap}× per day) — resets at midnight UTC`
    );
  }

  // Resolve points
  let points = ACTION_BASE_POINTS[action];
  let challengeResult: LogActionResult['challengeResult'];

  if (options.challenge) {
    const result = submitAnswer(
      options.challenge.challengeId,
      options.challenge.chosenOptionId
    );
    points = Math.round(ACTION_BASE_POINTS[action] * result.scoreFraction);
    challengeResult = {
      correct: result.correct,
      explanation: result.explanation,
    };
  }

  await redis.set(key, String(used + 1));
  if (used === 0) {
    await redis.expire(key, 86400);
  }

  const addResult = await addPoints(redis, userId, points);

  return {
    player: addResult.player,
    action,
    pointsEarned: points,
    leveledUp: addResult.leveledUp,
    remainingToday: cap - (used + 1),
    challengeResult,
  };
}
