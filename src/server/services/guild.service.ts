/* eslint-disable @typescript-eslint/no-explicit-any */
// src/server/core/guild.service.ts
import type { RedisClient } from '@devvit/web/server';
import type { Guild, GuildStatus, PlayerClass } from '../../shared/api';
import { GUILD_MULTIPLIERS } from '../../shared/api';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import {
  updateGuildLeaderboard,
  removeFromGuildLeaderboard,
} from './leaderboard.service';

const ALL_CLASSES: PlayerClass[] = ['RANGER', 'MENDER', 'WARDER', 'WEAVER'];

// create a guild
export async function createGuild(
  redis: RedisClient,
  guildName: string,
  founderId: string
): Promise<Guild> {
  if (!guildName || guildName.trim().length < 3) {
    throw new ValidationError('Guild name must be at least 3 characters');
  }

  const player = await redis.hGetAll(`player:${founderId}`);
  if (!player || !player.userId) {
    throw new NotFoundError(`Player ${founderId} not found`);
  }
  if (player.guildId) {
    throw new ConflictError('Player is already in a guild — leave first');
  }

  // Enforce unique guild names
  const nameKey = `guildname:${guildName.toLowerCase()}`;
  const nameTaken = await redis.get(nameKey);
  if (nameTaken) {
    throw new ConflictError(`Guild name "${guildName}" is already taken`);
  }

  const guildId = `guild_${Date.now()}_${founderId}`;

  await redis.hSet(`guild:${guildId}`, {
    guildId,
    name: guildName,
    founderId,
  });
  await redis.set(nameKey, guildId);

  await redis.zAdd(`guild:${guildId}:members`, { score: 0, member: founderId });
  await redis.hSet(`player:${founderId}`, { guildId });

  return { guildId, name: guildName, founderId, members: [founderId] };
}

// join a guild
export async function joinGuild(
  redis: RedisClient,
  guildId: string,
  userId: string
): Promise<GuildStatus> {
  const guild = await redis.hGetAll(`guild:${guildId}`);
  if (!guild || !guild.guildId) {
    throw new NotFoundError(`Guild ${guildId} not found`);
  }

  const player = await redis.hGetAll(`player:${userId}`);
  if (!player || !player.userId) {
    throw new NotFoundError(`Player ${userId} not found`);
  }
  if (player.guildId) {
    throw new ConflictError('Player is already in a guild — leave first');
  }

  await redis.zAdd(`guild:${guildId}:members`, { score: 0, member: userId });
  await redis.hSet(`player:${userId}`, { guildId });

  return getGuildStatus(redis, guildId);
}

// leave a guild
export async function leaveGuild(
  redis: RedisClient,
  userId: string
): Promise<{ left: boolean }> {
  const player = await redis.hGetAll(`player:${userId}`);
  if (!player || !player.userId) {
    throw new NotFoundError(`Player ${userId} not found`);
  }
  if (!player.guildId) {
    throw new ConflictError('Player is not in a guild');
  }

  const guildId = player.guildId;

  await redis.zRem(`guild:${guildId}:members`, [userId]);
  await redis.hSet(`player:${userId}`, { guildId: '' });

  // Recalculate guild score for remaining members, or clean up if empty
  const remaining = await redis.zRange(`guild:${guildId}:members`, 0, -1);
  if (remaining.length > 0) {
    await getGuildStatus(redis, guildId);
  } else {
    await removeFromGuildLeaderboard(redis, guildId);
  }

  return { left: true };
}

// get guild status
export async function getGuildStatus(
  redis: RedisClient,
  guildId: string
): Promise<GuildStatus> {
  const guild = await redis.hGetAll(`guild:${guildId}`);
  if (!guild || !guild.guildId) {
    throw new NotFoundError(`Guild ${guildId} not found`);
  }

  const members = await redis.zRange(`guild:${guildId}:members`, 0, -1);

  const memberIds = members.map((m: any) =>
    typeof m === 'string' ? m : m.member
  );

  const classesPresent = new Set<PlayerClass>();
  let totalPoints = 0;

  for (const memberId of memberIds) {
    const member = await redis.hGetAll(`player:${memberId}`);
    if (member?.class) classesPresent.add(member.class as PlayerClass);
    totalPoints += Number.parseInt(member?.points || '0');
  }

  const completedCount = ALL_CLASSES.filter((c) =>
    classesPresent.has(c)
  ).length;
  const multiplier =
    completedCount === 4
      ? GUILD_MULTIPLIERS.COMPLETE
      : completedCount >= 2
        ? GUILD_MULTIPLIERS.PARTIAL
        : GUILD_MULTIPLIERS.SOLO;

  const guildScore = Math.floor(totalPoints * multiplier);

  await updateGuildLeaderboard(redis, guildId, guildScore);

  return {
    guild: {
      guildId: guild.guildId,
      name: guild.name!,
      founderId: guild.founderId!,
    },
    members: memberIds,
    classesPresent: [...classesPresent],
    totalPoints,
    multiplier,
    guildScore,
    isComplete: completedCount === 4,
  };
}

// list guild for (for join/browse screen)
export async function listGuilds(
  redis: RedisClient,
  limit: number = 20
): Promise<{ guildId: string; score: number }[]> {
  const results = await redis.zRange('leaderboard:guilds', 0, limit - 1, {
    by: 'rank',
    reverse: true,
  });

  return results.map((r: any) => ({ guildId: r.member, score: r.score }));
}
