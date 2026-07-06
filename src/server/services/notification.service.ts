import type { RedisClient } from '@devvit/web/server';
import type {
  AppNotification,
  CreateNotificationInput,
} from '../../shared/notification';
import { NotFoundError, ConflictError } from '../utils/errors';
import { publishToUser } from '../utils/realtime';

const NOTIFICATION_TTL_SECONDS = 14 * 24 * 60 * 60; // 2 weeks
const MAX_STORED_PER_USER = 50;

function notifKey(id: string) {
  return `notification:${id}`;
}
function userIndexKey(userId: string) {
  return `notifications:${userId}`;
}

function memberOf(entry: string | { member: string; score: number }): string {
  return typeof entry === 'string' ? entry : entry.member;
}

// createNotification
export async function createNotification(
  redis: RedisClient,
  input: CreateNotificationInput
): Promise<AppNotification> {
  const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();

  const notification: AppNotification = {
    id,
    type: input.type,
    title: input.title,
    subtitle: input.subtitle,
    createdAt: now,
    avatarInitial: input.avatarInitial,
    avatarColor: input.avatarColor,
    read: false,
    payload: input.payload,
  };

  await redis.set(notifKey(id), JSON.stringify(notification));
  await redis.expire(notifKey(id), NOTIFICATION_TTL_SECONDS);

  await redis.zAdd(userIndexKey(input.userId), { score: now, member: id });

  // Trim to the most recent MAX_STORED_PER_USER — drop the oldest beyond that
  const allIds = (await redis.zRange(userIndexKey(input.userId), 0, -1)).map(
    memberOf
  );
  if (allIds.length > MAX_STORED_PER_USER) {
    const toDrop = allIds.slice(0, allIds.length - MAX_STORED_PER_USER);
    await redis.zRem(userIndexKey(input.userId), toDrop);
    await Promise.all(toDrop.map((oldId) => redis.del(notifKey(oldId))));
  }

  const notificationJson = JSON.stringify(notification);

  // Best-effort push. Never blocks or throws — see realtime.ts for why.
  await publishToUser(input.userId, notificationJson);

  return notification;
}

// listNotifications
export async function listNotifications(
  redis: RedisClient,
  userId: string,
  limit: number = 20
): Promise<AppNotification[]> {
  const ids = (
    await redis.zRange(userIndexKey(userId), 0, -1, {
      by: 'rank',
      reverse: true,
    })
  )
    .map(memberOf)
    .slice(0, limit);

  const raw = await Promise.all(ids.map((id) => redis.get(notifKey(id))));
  return raw
    .filter((r): r is string => r !== null)
    .map((r) => JSON.parse(r) as AppNotification);
}

// markAsRead
export async function markAsRead(
  redis: RedisClient,
  userId: string,
  notificationId: string
): Promise<AppNotification> {
  const raw = await redis.get(notifKey(notificationId));
  if (!raw) throw new NotFoundError('Notification not found');

  const notification: AppNotification = JSON.parse(raw);

  const belongs = await redis
    .zScore(userIndexKey(userId), notificationId)
    .catch(() => null);
  if (belongs === null || belongs === undefined) {
    throw new ConflictError('This notification does not belong to this user');
  }

  notification.read = true;
  await redis.set(notifKey(notificationId), JSON.stringify(notification));
  return notification;
}

//  deleteNotification
export async function deleteNotification(
  redis: RedisClient,
  userId: string,
  notificationId: string
): Promise<{ deleted: true }> {
  await redis.zRem(userIndexKey(userId), [notificationId]);
  await redis.del(notifKey(notificationId));
  return { deleted: true };
}

// deleteAllNotifications
export async function deleteAllNotifications(
  redis: RedisClient,
  userId: string
): Promise<{ deleted: number }> {
  const ids = (await redis.zRange(userIndexKey(userId), 0, -1)).map(memberOf);
  await Promise.all(ids.map((id) => redis.del(notifKey(id))));
  await redis.del(userIndexKey(userId));
  return { deleted: ids.length };
}
