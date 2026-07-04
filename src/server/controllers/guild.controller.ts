import type { Context } from 'hono';
import { redis } from '@devvit/web/server';
import * as guildService from '../services/guild.service';
import { handleError } from '../utils/handle-error';
import { ValidationError } from '../utils/errors';

// POST /api/guild - create a guild
export async function createGuild(c: Context) {
  try {
    const body = await c.req.json().catch(() => ({}));
    const name = (body.name as string | undefined)?.trim();
    const founderId = (body.founderId as string | undefined)?.trim();

    if (!name) throw new ValidationError('name is required');
    if (!founderId) throw new ValidationError('founderId is required');

    const guild = await guildService.createGuild(redis, name, founderId);
    return c.json(guild, 201);
  } catch (error) {
    return handleError(c, error);
  }
}

// ── POST /api/guild/:guildId/join ─────────────────────────────────────────────
export async function joinGuild(c: Context) {
  try {
    const guildId = c.req.param('guildId')?.trim();
    const body = await c.req.json().catch(() => ({}));
    const userId = (body.userId as string | undefined)?.trim();

    if (!guildId) throw new ValidationError('guildId is required');
    if (!userId) throw new ValidationError('userId is required');

    const status = await guildService.joinGuild(redis, guildId, userId);
    return c.json(status);
  } catch (error) {
    return handleError(c, error);
  }
}

// ── POST /api/guild/leave ─────────────────────────────────────────────────────
export async function leaveGuild(c: Context) {
  try {
    const body = await c.req.json().catch(() => ({}));
    const userId = (body.userId as string | undefined)?.trim();

    if (!userId) throw new ValidationError('userId is required');

    const result = await guildService.leaveGuild(redis, userId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}

// ── GET /api/guild/:guildId ────────────────────────────────────────────────────
export async function getGuildStatus(c: Context) {
  try {
    const guildId = c.req.param('guildId')?.trim();
    if (!guildId) throw new ValidationError('guildId is required');

    const status = await guildService.getGuildStatus(redis, guildId);
    return c.json(status);
  } catch (error) {
    return handleError(c, error);
  }
}

// ── GET /api/guild?limit=20 ── browse/join screen ─────────────────────────────
export async function listGuilds(c: Context) {
  try {
    const limitParam = c.req.query('limit');
    const limit = limitParam ? Number.parseInt(limitParam) : 20;

    const guilds = await guildService.listGuilds(redis, limit);
    return c.json({ guilds });
  } catch (error) {
    return handleError(c, error);
  }
}
