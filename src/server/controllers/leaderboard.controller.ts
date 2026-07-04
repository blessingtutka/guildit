import type { Context } from 'hono';
import { redis } from '@devvit/web/server';
import * as leaderboardService from '../services/leaderboard.service';
import { handleError } from '../utils/handle-error';
import { ValidationError } from '../utils/errors';
import type { PlayerClass } from '../../shared/api';

const VALID_CLASSES: Set<PlayerClass> = new Set([
  'RANGER',
  'MENDER',
  'WARDER',
  'WEAVER',
]);

// GET /api/leaderboard/class/:class?limit=10
export async function getClassLeaderboard(c: Context) {
  try {
    const playerClass = c.req.param('class')?.toUpperCase() as PlayerClass;
    const limitParam = c.req.query('limit');
    const limit = limitParam ? Number.parseInt(limitParam) : 10;

    if (!VALID_CLASSES.has(playerClass)) {
      throw new ValidationError(`Invalid class: ${c.req.param('class')}`);
    }

    const leaderboard = await leaderboardService.getClassLeaderboard(
      redis,
      playerClass,
      limit
    );
    return c.json({ class: playerClass, leaderboard });
  } catch (error) {
    return handleError(c, error);
  }
}

// GET /api/leaderboard/guilds?limit=10
export async function getGuildLeaderboard(c: Context) {
  try {
    const limitParam = c.req.query('limit');
    const limit = limitParam ? Number.parseInt(limitParam) : 10;

    const leaderboard = await leaderboardService.getGuildLeaderboard(
      redis,
      limit
    );
    return c.json({ leaderboard });
  } catch (error) {
    return handleError(c, error);
  }
}

// GET /api/leaderboard/stats
// Returns aggregate counts for the splash page
export async function getStats(c: Context) {
  try {
    const classes: PlayerClass[] = ['RANGER', 'MENDER', 'WARDER', 'WEAVER'];
    const [guildCount, ...classCounts] = await Promise.all([
      leaderboardService.getGuildCount(redis),
      ...classes.map((cls) => leaderboardService.getClassPlayerCount(redis, cls)),
    ]);

    const classByCounts: Record<PlayerClass, number> = {
      RANGER: classCounts[0] ?? 0,
      MENDER: classCounts[1] ?? 0,
      WARDER: classCounts[2] ?? 0,
      WEAVER: classCounts[3] ?? 0,
    };

    const totalPlayers = Object.values(classByCounts).reduce((a, b) => a + b, 0);

    return c.json({ totalPlayers, guildCount, byClass: classByCounts });
  } catch (error) {
    return handleError(c, error);
  }
}
