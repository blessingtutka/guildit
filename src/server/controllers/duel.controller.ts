import type { Context } from 'hono';
import { redis } from '@devvit/web/server';
import * as duelService from '../services/duel.service';
import { handleError } from '../utils/handle-error';
import { ValidationError } from '../utils/errors';

//  POST /api/duel/invite - send an invite
export async function sendInvite(c: Context) {
  try {
    const body = await c.req.json().catch(() => ({}));
    const fromUserId = (body.fromUserId as string | undefined)?.trim();
    const toUserId = (body.toUserId as string | undefined)?.trim();

    if (!fromUserId) throw new ValidationError('fromUserId is required');
    if (!toUserId) throw new ValidationError('toUserId is required');

    const invite = await duelService.sendInvite(redis, fromUserId, toUserId);
    return c.json(invite, 201);
  } catch (error) {
    return handleError(c, error);
  }
}

// GET /api/duel/invite/incoming?userId=xxx
export async function getIncomingInvites(c: Context) {
  try {
    const userId = c.req.query('userId')?.trim();
    if (!userId) throw new ValidationError('userId is required');

    const invites = await duelService.listIncomingInvites(redis, userId);
    return c.json({ invites });
  } catch (error) {
    return handleError(c, error);
  }
}

// GET /api/duel/invite/outgoing?userId=xxx
export async function getOutgoingInvites(c: Context) {
  try {
    const userId = c.req.query('userId')?.trim();
    if (!userId) throw new ValidationError('userId is required');

    const invites = await duelService.listOutgoingInvites(redis, userId);
    return c.json({ invites });
  } catch (error) {
    return handleError(c, error);
  }
}

// POST /api/duel/invite/:inviteId/accept - resolves the duel instantly
export async function acceptInvite(c: Context) {
  try {
    const inviteId = c.req.param('inviteId')?.trim();
    const body = await c.req.json().catch(() => ({}));
    const userId = (body.userId as string | undefined)?.trim();

    if (!inviteId) throw new ValidationError('inviteId is required');
    if (!userId) throw new ValidationError('userId is required');

    const result = await duelService.acceptInvite(redis, inviteId, userId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}

// POST /api/duel/invite/:inviteId/decline
export async function declineInvite(c: Context) {
  try {
    const inviteId = c.req.param('inviteId')?.trim();
    const body = await c.req.json().catch(() => ({}));
    const userId = (body.userId as string | undefined)?.trim();

    if (!inviteId) throw new ValidationError('inviteId is required');
    if (!userId) throw new ValidationError('userId is required');

    const invite = await duelService.declineInvite(redis, inviteId, userId);
    return c.json(invite);
  } catch (error) {
    return handleError(c, error);
  }
}

// POST /api/duel/invite/:inviteId/cancel
export async function cancelInvite(c: Context) {
  try {
    const inviteId = c.req.param('inviteId')?.trim();
    const body = await c.req.json().catch(() => ({}));
    const userId = (body.userId as string | undefined)?.trim();

    if (!inviteId) throw new ValidationError('inviteId is required');
    if (!userId) throw new ValidationError('userId is required');

    const invite = await duelService.cancelInvite(redis, inviteId, userId);
    return c.json(invite);
  } catch (error) {
    return handleError(c, error);
  }
}

//  GET /api/duel/:duelId - fetch a resolved replay
export async function getDuelResult(c: Context) {
  try {
    const duelId = c.req.param('duelId')?.trim();
    if (!duelId) throw new ValidationError('duelId is required');

    const result = await duelService.getDuelResult(redis, duelId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}
