/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RedisClient } from '@devvit/web/server';
import type { PlayerClass } from '../../shared/api';

export interface ClassLeaderboardEntry {
  userId: string;
  username: string;
  score: number;
}

export interface GuildLeaderboardEntry {
  guildId: string;
  name: string;
  score: number;
}

//  Class leaderboard (top players per class)
export async function getClassLeaderboard(
  redis: RedisClient,
  playerClass: PlayerClass,
  limit: number = 10
): Promise<ClassLeaderboardEntry[]> {
  const results = await redis.zRange(
    `leaderboard:class:${playerClass}`,
    0,
    limit - 1,
    { by: 'rank', reverse: true }
  );

  const ranked: { userId: string; score: number }[] = results.map((r: any) =>
    typeof r === 'string'
      ? { userId: r, score: 0 }
      : { userId: r.member, score: r.score }
  );

  const withNames = await Promise.all(
    ranked.map(async (entry) => {
      const username = await redis.hGet(`player:${entry.userId}`, 'username');
      return {
        userId: entry.userId,
        username: username || 'Unknown Player', // player may have been deleted
        score: entry.score,
      };
    })
  );

  return withNames;
}

// Guild leaderboard (top guilds by score)
export async function getGuildLeaderboard(
  redis: RedisClient,
  limit: number = 10
): Promise<GuildLeaderboardEntry[]> {
  const results = await redis.zRange('leaderboard:guilds', 0, limit - 1, {
    by: 'rank',
    reverse: true,
  });

  const ranked: { guildId: string; score: number }[] = results.map((r: any) =>
    typeof r === 'string'
      ? { guildId: r, score: 0 }
      : { guildId: r.member, score: r.score }
  );

  const withNames = await Promise.all(
    ranked.map(async (entry) => {
      const name = await redis.hGet(`guild:${entry.guildId}`, 'name');
      return {
        guildId: entry.guildId,
        name: name || 'Unknown Guild', // guild may have been disbanded
        score: entry.score,
      };
    })
  );

  return withNames;
}

// Counts
export async function getClassPlayerCount(
  redis: RedisClient,
  playerClass: PlayerClass
): Promise<number> {
  return await redis.zCard(`leaderboard:class:${playerClass}`);
}

export async function getGuildCount(redis: RedisClient): Promise<number> {
  return await redis.zCard('leaderboard:guilds');
}

// Write helpers ====
export async function updateClassLeaderboard(
  redis: RedisClient,
  playerClass: PlayerClass,
  userId: string,
  points: number
): Promise<void> {
  await redis.zAdd(`leaderboard:class:${playerClass}`, {
    score: points,
    member: userId,
  });
}

export async function removeFromClassLeaderboard(
  redis: RedisClient,
  playerClass: PlayerClass,
  userId: string
): Promise<void> {
  await redis.zRem(`leaderboard:class:${playerClass}`, [userId]);
}

export async function updateGuildLeaderboard(
  redis: RedisClient,
  guildId: string,
  score: number
): Promise<void> {
  await redis.zAdd('leaderboard:guilds', { score, member: guildId });
}

export async function removeFromGuildLeaderboard(
  redis: RedisClient,
  guildId: string
): Promise<void> {
  await redis.zRem('leaderboard:guilds', [guildId]);
}
