import type { RedisClient } from '@devvit/web/server';
import type { Player, PlayerClass, ReclassPreview } from '../../shared/api';
import { getLevel, previewReclass } from '../utils/level-system';
import { NotFoundError, ConflictError } from '../utils/errors';
import { getGuildStatus } from './guild.service';
import {
  updateClassLeaderboard,
  removeFromClassLeaderboard,
} from './leaderboard.service';

// helper: hydrate a raw Redis hash into a typed Player
function hydratePlayer(
  userId: string,
  raw: Record<string, string>
): Player & { level: number } {
  const points = Number.parseInt(raw.points || '0');
  return {
    userId,
    username: raw.username || 'anonymous',
    class: (raw.class as PlayerClass) || null,
    points,
    level: getLevel(points),
    guildId: raw.guildId || null,
    snoovatar: raw.snoovatar || null,
  };
}

// create or get player
export async function createOrGetPlayer(
  redis: RedisClient,
  userId: string,
  username: string,
  snoovatar?: string
): Promise<Player & { level: number }> {
  const key = `player:${userId}`;
  const existing = await redis.hGetAll(key);

  if (existing && existing.userId) {
    // Update snoovatar if it changed
    if (snoovatar && existing.snoovatar !== snoovatar) {
      await redis.hSet(key, { snoovatar });
      return hydratePlayer(userId, { ...existing, snoovatar });
    }
    return hydratePlayer(userId, existing);
  }

  await redis.hSet(key, {
    userId,
    username,
    class: '',
    points: '0',
    guildId: '',
    snoovatar: snoovatar ?? '',
  });

  return {
    userId,
    username,
    class: null,
    points: 0,
    level: 1,
    guildId: null,
    snoovatar: snoovatar ?? null,
  };
}

// get a player
export async function getPlayer(
  redis: RedisClient,
  userId: string
): Promise<Player & { level: number }> {
  const raw = await redis.hGetAll(`player:${userId}`);
  if (!raw || !raw.userId) {
    throw new NotFoundError(`Player ${userId} not found`);
  }
  return hydratePlayer(userId, raw);
}

// set class for a player (ifrst time only)
export async function setPlayerClass(
  redis: RedisClient,
  userId: string,
  playerClass: PlayerClass
): Promise<Player & { level: number }> {
  const key = `player:${userId}`;
  const existing = await redis.hGetAll(key);

  if (!existing || !existing.userId) {
    throw new NotFoundError(`Player ${userId} not found`);
  }

  if (existing.class && existing.class !== '') {
    throw new ConflictError('Class already set — use /reclass to change it');
  }

  await redis.hSet(key, { class: playerClass });

  const points = Number.parseInt(existing.points || '0');

  // Register on the class leaderboard at their current points (usually 0)
  await updateClassLeaderboard(redis, playerClass, userId, points);

  return hydratePlayer(userId, { ...existing, class: playerClass });
}

// add point to a player and recalculate level
export interface AddPointsResult {
  player: Player & { level: number };
  leveledUp: boolean;
  pointsAdded: number;
}

export async function addPoints(
  redis: RedisClient,
  userId: string,
  pointsToAdd: number
): Promise<AddPointsResult> {
  const key = `player:${userId}`;
  const existing = await redis.hGetAll(key);

  if (!existing || !existing.userId) {
    throw new NotFoundError(`Player ${userId} not found`);
  }

  const oldPoints = Number.parseInt(existing.points || '0');
  const oldLevel = getLevel(oldPoints);
  const newPoints = Math.max(oldPoints + pointsToAdd, 0);
  const newLevel = getLevel(newPoints);

  await redis.hSet(key, { points: String(newPoints) });

  if (existing.class) {
    await updateClassLeaderboard(
      redis,
      existing.class as PlayerClass,
      userId,
      newPoints
    );
  }

  // Guild score depends on member points - recalculate if applicable
  if (existing.guildId) {
    await getGuildStatus(redis, existing.guildId);
  }

  return {
    player: hydratePlayer(userId, { ...existing, points: String(newPoints) }),
    leveledUp: newLevel > oldLevel,
    pointsAdded: pointsToAdd,
  };
}

// get player reclass preview (to show cost) (read only)
export async function getPlayerReclassPreview(
  redis: RedisClient,
  userId: string
): Promise<ReclassPreview> {
  const existing = await redis.hGetAll(`player:${userId}`);

  if (!existing || !existing.userId) {
    throw new NotFoundError(`Player ${userId} not found`);
  }

  const points = Number.parseInt(existing.points || '0');
  return previewReclass(points);
}

//  change the class of a player (cost depending on level)
export interface ChangeClassResult {
  player: Player & { level: number };
  cost: number;
  taxRate: number;
}

export async function changeClass(
  redis: RedisClient,
  userId: string,
  newClass: PlayerClass
): Promise<ChangeClassResult> {
  const key = `player:${userId}`;
  const existing = await redis.hGetAll(key);

  if (!existing || !existing.userId) {
    throw new NotFoundError(`Player ${userId} not found`);
  }

  const currentClass = (existing.class || null) as PlayerClass | null;

  if (!currentClass) {
    throw new ConflictError(
      'Player has no class yet — use /class to set one first'
    );
  }

  if (currentClass === newClass) {
    throw new ConflictError(`Already a ${newClass}`);
  }

  const currentPoints = Number.parseInt(existing.points || '0');
  const preview = previewReclass(currentPoints);

  await redis.hSet(key, {
    class: newClass,
    points: String(preview.newPoints),
  });

  await removeFromClassLeaderboard(redis, currentClass, userId);
  await updateClassLeaderboard(redis, newClass, userId, preview.newPoints);

  if (existing.guildId) {
    await getGuildStatus(redis, existing.guildId);
  }

  return {
    player: hydratePlayer(userId, {
      ...existing,
      class: newClass,
      points: String(preview.newPoints),
    }),
    cost: preview.cost,
    taxRate: preview.taxRate,
  };
}
