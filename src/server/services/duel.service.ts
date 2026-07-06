import type { RedisClient } from '@devvit/web/server';
import type {
  Duel,
  DuelInvite,
  PlayerClass,
  ActionType,
} from '../../shared/api';
import {
  CLASS_ACTIONS,
  DUEL_ADVANTAGE,
  DUEL_ADVANTAGE_MULTIPLIER,
  INVITE_EXPIRY_MS,
} from '../../shared/api';
import { ACTION_LABELS, CLASS_META } from '../../shared/web';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';
import { createNotification } from './notification.service';

const DEFAULT_STAKE = 10;

// ==============================================================================
// TYPES
// ==============================================================================

export interface TurnLogEntry {
  turn: number;
  playerName: string;
  action: ActionType;
  label: string;
  points: number;
  playerClass: PlayerClass;
  statsAfter: {
    influence: number;
    reputation: number;
    creativity: number;
    trust: number;
  };
  isFinisher: boolean;
}

export interface DuelResult {
  duelId: string;
  challengerName: string;
  challengedName: string;
  winnerName: string;
  turns: TurnLogEntry[];
}

// ==============================================================================
// INVITES
// ==============================================================================

function inviteKey(id: string) {
  return `invite:${id}`;
}

function memberOf(entry: string | { member: string; score: number }): string {
  return typeof entry === 'string' ? entry : entry.member;
}

export async function sendInvite(
  redis: RedisClient,
  fromUserId: string,
  toUserId: string
): Promise<DuelInvite> {
  if (fromUserId === toUserId) {
    throw new ValidationError("Can't invite yourself");
  }

  const fromPlayer = await redis.hGetAll(`player:${fromUserId}`);
  const toPlayer = await redis.hGetAll(`player:${toUserId}`);

  if (!fromPlayer?.userId) throw new NotFoundError('Sender not found');
  if (!toPlayer?.userId) throw new NotFoundError('Target player not found');
  if (!fromPlayer.class)
    throw new ConflictError('You need a class before dueling');
  if (!toPlayer.class) throw new ConflictError('That player has no class yet');

  const outgoingIds = (
    await redis.zRange(`invites:outgoing:${fromUserId}`, 0, -1)
  ).map(memberOf);
  for (const existingId of outgoingIds) {
    const existing = await readInvite(redis, existingId);
    if (
      existing &&
      existing.toUserId === toUserId &&
      existing.status === 'pending'
    ) {
      throw new ConflictError(
        'You already have a pending invite to this player'
      );
    }
  }

  const inviteId = `invite_${Date.now()}_${fromUserId}`;
  const now = Date.now();

  const invite: DuelInvite = {
    inviteId,
    fromUserId,
    fromUsername: fromPlayer.username as string,
    fromClass: fromPlayer.class as PlayerClass,
    toUserId,
    toUsername: toPlayer.username as string,
    status: 'pending',
    createdAt: now,
    expiresAt: now + INVITE_EXPIRY_MS,
  };

  await redis.set(inviteKey(inviteId), JSON.stringify(invite));
  await redis.expire(
    inviteKey(inviteId),
    Math.ceil(INVITE_EXPIRY_MS / 1000) + 60
  );

  await redis.zAdd(`invites:incoming:${toUserId}`, {
    score: now,
    member: inviteId,
  });
  await redis.zAdd(`invites:outgoing:${fromUserId}`, {
    score: now,
    member: inviteId,
  });

  // Notify the recipient
  const fromClassMeta = CLASS_META[fromPlayer.class as PlayerClass];
  await createNotification(redis, {
    userId: toUserId,
    type: 'duel_invite',
    title: `${fromPlayer.username} challenged you to a duel`,
    subtitle: fromClassMeta.name,
    avatarInitial:
      (fromPlayer.username as string).charAt(0).toUpperCase() || '?',
    avatarColor: fromClassMeta.color,
    payload: invite,
  });

  return invite;
}

async function readInvite(
  redis: RedisClient,
  inviteId: string
): Promise<DuelInvite | null> {
  const raw = await redis.get(inviteKey(inviteId));
  if (!raw) return null;

  const invite: DuelInvite = JSON.parse(raw);

  if (invite.status === 'pending' && Date.now() > invite.expiresAt) {
    invite.status = 'expired';
    await redis.set(inviteKey(inviteId), JSON.stringify(invite));
  }

  return invite;
}

export async function listIncomingInvites(
  redis: RedisClient,
  userId: string
): Promise<DuelInvite[]> {
  const ids = (await redis.zRange(`invites:incoming:${userId}`, 0, -1)).map(
    memberOf
  );
  const invites = await Promise.all(ids.map((id) => readInvite(redis, id)));
  return invites.filter(
    (i): i is DuelInvite => i !== null && i.status === 'pending'
  );
}

export async function listOutgoingInvites(
  redis: RedisClient,
  userId: string
): Promise<DuelInvite[]> {
  const ids = (await redis.zRange(`invites:outgoing:${userId}`, 0, -1)).map(
    memberOf
  );
  const invites = await Promise.all(ids.map((id) => readInvite(redis, id)));
  return invites.filter((i): i is DuelInvite => i !== null);
}

export async function acceptInvite(
  redis: RedisClient,
  inviteId: string,
  accepterId: string
): Promise<DuelResult> {
  const invite = await readInvite(redis, inviteId);
  if (!invite) throw new NotFoundError('Invite not found');
  if (invite.toUserId !== accepterId)
    throw new ConflictError('This invite is not yours to accept');
  if (invite.status !== 'pending')
    throw new ConflictError(`Invite is ${invite.status}`);

  const duel = await challengeDuel(
    redis,
    invite.fromUserId,
    invite.toUserId,
    DEFAULT_STAKE
  );
  const result = await resolveDuel(redis, duel.duelId);

  invite.status = 'accepted';
  invite.duelId = duel.duelId;
  await redis.set(inviteKey(inviteId), JSON.stringify(invite));
  await cleanupInviteIndexes(redis, invite);

  // Notify the ORIGINAL sender that their challenge was accepted
  const accepterPlayer = await redis.hGetAll(`player:${accepterId}`);
  const accepterClassMeta = accepterPlayer.class
    ? CLASS_META[accepterPlayer.class as PlayerClass]
    : null;

  await createNotification(redis, {
    userId: invite.fromUserId,
    type: 'duel_accepted',
    title: `${invite.toUsername} accepted your challenge`,
    subtitle: accepterClassMeta?.name,
    avatarInitial: invite.toUsername[0]?.toUpperCase() ?? '?',
    avatarColor: accepterClassMeta?.color ?? '#c8a84b',
    payload: { duelId: duel.duelId, inviteId },
  });

  return result;
}

export async function declineInvite(
  redis: RedisClient,
  inviteId: string,
  declinerId: string
): Promise<DuelInvite> {
  const invite = await readInvite(redis, inviteId);
  if (!invite) throw new NotFoundError('Invite not found');
  if (invite.toUserId !== declinerId)
    throw new ConflictError('This invite is not yours to decline');
  if (invite.status !== 'pending')
    throw new ConflictError(`Invite is ${invite.status}`);

  invite.status = 'declined';
  await redis.set(inviteKey(inviteId), JSON.stringify(invite));
  await cleanupInviteIndexes(redis, invite);

  // Notify the original sender of the decline
  await createNotification(redis, {
    userId: invite.fromUserId,
    type: 'duel_declined',
    title: `${invite.toUsername} declined your challenge`,
    avatarInitial: invite.toUsername[0]?.toUpperCase() ?? '?',
    avatarColor: '#8891aa',
    payload: { inviteId },
  });

  return invite;
}

export async function cancelInvite(
  redis: RedisClient,
  inviteId: string,
  cancelerId: string
): Promise<DuelInvite> {
  const invite = await readInvite(redis, inviteId);
  if (!invite) throw new NotFoundError('Invite not found');
  if (invite.fromUserId !== cancelerId)
    throw new ConflictError('This invite is not yours to cancel');
  if (invite.status !== 'pending')
    throw new ConflictError(`Invite is ${invite.status}`);

  invite.status = 'cancelled';
  await redis.set(inviteKey(inviteId), JSON.stringify(invite));
  await cleanupInviteIndexes(redis, invite);

  return invite;
}

async function cleanupInviteIndexes(redis: RedisClient, invite: DuelInvite) {
  await redis.zRem(`invites:incoming:${invite.toUserId}`, [invite.inviteId]);
  await redis.zRem(`invites:outgoing:${invite.fromUserId}`, [invite.inviteId]);
}

// ==============================================================================
// DUEL
// ==============================================================================

async function challengeDuel(
  redis: RedisClient,
  challengerId: string,
  challengedId: string,
  stake: number
): Promise<Duel> {
  const challenger = await redis.hGetAll(`player:${challengerId}`);

  const challengerPoints = Number.parseInt(challenger.points || '0');
  if (challengerPoints < stake) {
    throw new ConflictError('Not enough points to stake');
  }

  const duelId = `duel_${Date.now()}_${challengerId}`;
  const duel: Duel = {
    duelId,
    challenger: challengerId,
    challenged: challengedId,
    stake,
    prompt: 'Build the strongest Conversation Chain',
    status: 'pending',
    winnerId: null,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  await redis.set(`duel:${duelId}`, JSON.stringify(duel));
  await redis.expire(`duel:${duelId}`, 24 * 60 * 60);

  return duel;
}

async function resolveDuel(
  redis: RedisClient,
  duelId: string
): Promise<DuelResult> {
  const raw = await redis.get(`duel:${duelId}`);
  if (!raw) throw new NotFoundError(`Duel ${duelId} not found`);

  const duel: Duel = JSON.parse(raw);
  if (duel.status === 'complete') {
    throw new ConflictError('Duel already resolved');
  }

  const challenger = await redis.hGetAll(`player:${duel.challenger}`);
  const challenged = await redis.hGetAll(`player:${duel.challenged}`);

  const challengerClass = challenger.class as PlayerClass;
  const challengedClass = challenged.class as PlayerClass;

  const challengerActions = CLASS_ACTIONS[challengerClass].slice(0, 3);
  const challengedActions = CLASS_ACTIONS[challengedClass].slice(0, 3);

  const turns: TurnLogEntry[] = [];
  const stats = { influence: 50, reputation: 10, creativity: 8, trust: 12 };

  let challengerScore = 0;
  let challengedScore = 0;

  const advantageBonus =
    DUEL_ADVANTAGE[challengerClass] === challengedClass
      ? DUEL_ADVANTAGE_MULTIPLIER
      : 1.0;

  const maxLen = Math.max(challengerActions.length, challengedActions.length);
  let turnNum = 1;

  for (let i = 0; i < maxLen; i++) {
    const cAction = challengerActions[i];
    if (cAction) {
      const gain = 5 * advantageBonus;
      challengerScore += gain;
      stats.influence += Math.round(gain);
      turns.push(
        buildTurn(
          turnNum++,
          challenger.username as string,
          cAction,
          challengerClass,
          Math.round(gain),
          stats
        )
      );
    }
    const dAction = challengedActions[i];
    if (dAction) {
      const gain = 5;
      challengedScore += gain;
      stats.trust += Math.round(gain / 2);
      turns.push(
        buildTurn(
          turnNum++,
          challenged.username as string,
          dAction,
          challengedClass,
          gain,
          stats
        )
      );
    }
  }

  const lastTurn = turns.at(-1);
  if (lastTurn) lastTurn.isFinisher = true;

  const winnerId =
    challengerScore >= challengedScore ? duel.challenger : duel.challenged;
  const winnerName =
    challengerScore >= challengedScore
      ? challenger.username
      : challenged.username;
  const loserId =
    winnerId === duel.challenger ? duel.challenged : duel.challenger;

  await transferStake(redis, winnerId, loserId, duel.stake);

  duel.status = 'complete';
  duel.winnerId = winnerId;
  await redis.set(`duel:${duelId}`, JSON.stringify(duel));

  const result: DuelResult = {
    duelId,
    challengerName: challenger.username as string,
    challengedName: challenged.username as string,
    winnerName: winnerName as string,
    turns,
  };

  await redis.set(`duelresult:${duelId}`, JSON.stringify(result));
  await redis.expire(`duelresult:${duelId}`, 7 * 24 * 60 * 60);

  return result;
}

export async function getDuelResult(
  redis: RedisClient,
  duelId: string
): Promise<DuelResult> {
  const raw = await redis.get(`duelresult:${duelId}`);
  if (!raw) throw new NotFoundError(`Duel result ${duelId} not found`);
  return JSON.parse(raw);
}

function buildTurn(
  turn: number,
  playerName: string,
  action: ActionType,
  playerClass: PlayerClass,
  points: number,
  stats: {
    influence: number;
    reputation: number;
    creativity: number;
    trust: number;
  }
): TurnLogEntry {
  return {
    turn,
    playerName,
    action,
    label: ACTION_LABELS[action].label,
    points,
    playerClass,
    statsAfter: { ...stats },
    isFinisher: false,
  };
}

async function transferStake(
  redis: RedisClient,
  winnerId: string,
  loserId: string,
  stake: number
): Promise<void> {
  const loser = await redis.hGetAll(`player:${loserId}`);
  const winner = await redis.hGetAll(`player:${winnerId}`);

  const loserPoints = Math.max(Number.parseInt(loser.points || '0') - stake, 0);
  const winnerPoints = Number.parseInt(winner.points || '0') + stake;

  await redis.hSet(`player:${loserId}`, { points: String(loserPoints) });
  await redis.hSet(`player:${winnerId}`, { points: String(winnerPoints) });
}
