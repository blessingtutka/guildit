import { Devvit } from '@devvit/public-api';
import { calculatePassivePoints } from '../utils/points-calculator';
import type { PlayerClass } from '../../shared/api';
import { addPoints } from '../services/player.service';
import { scheduleDelayedCheck } from '../utils/scheduler';
import { classifyText } from '../utils/content-heuristics';
import { createNotification } from '../services/notification.service';
import type { RedisClient as TriggerRedis } from '@devvit/public-api';
import type { RedisClient } from '@devvit/web/server';

const CRAFT_CHECK_DELAY_MS = 24 * 60 * 60 * 1000;
const COUNSEL_CHECK_DELAY_MS = 12 * 60 * 60 * 1000;
const INSPIRE_CHECK_DELAY_MS = 24 * 60 * 60 * 1000;

const CLASS_AVATAR_COLOR: Record<PlayerClass, string> = {
  RANGER: '#E07B39',
  MENDER: '#5BAD6F',
  WARDER: '#4A90D9',
  WEAVER: '#9B59B6',
};

export function asServerRedis(redis: TriggerRedis): RedisClient {
  return redis as unknown as RedisClient;
}

async function getPlayer(redis: RedisClient, userId: string) {
  return redis.hGetAll(`player:${userId}`);
}

async function notifyPointsEarned(
  redis: RedisClient,
  userId: string,
  username: string,
  playerClass: PlayerClass,
  points: number,
  reason: string
) {
  if (points <= 0) return;
  await createNotification(redis, {
    userId,
    type: 'points_earned',
    title: `+${points} points`,
    subtitle: reason,
    avatarInitial: username[0]?.toUpperCase() ?? '?',
    avatarColor: CLASS_AVATAR_COLOR[playerClass],
    payload: { points, reason },
  });
}

Devvit.addTrigger({
  event: 'CommentCreate',
  onEvent: async (event, context) => {
    const { redis: predis } = context;
    const redis = asServerRedis(predis);
    const userId = event.comment?.author;
    const commentId = event.comment?.id;
    const body = event.comment?.body;
    if (!userId || !commentId) return;

    let parentId = event.comment?.parentId;
    if (!parentId) {
      try {
        const fullComment = await context.reddit.getCommentById(commentId);
        parentId = fullComment?.parentId;
      } catch (err) {
        console.warn('[reddit-events] Could not resolve parentId:', err);
      }
    }

    const player = await getPlayer(redis, userId);
    if (!player?.userId || !player.class) return;

    const playerClass = player.class as PlayerClass;
    const classification = classifyText(body);

    const event_ = classification.isDefendingUser
      ? playerClass === 'WARDER'
        ? 'WARDER_GUARD'
        : 'DEFENSE_REPLY'
      : classification.isSupportiveContext
        ? 'SUPPORTIVE_REPLY'
        : 'COMMENT_CREATED';

    const points = calculatePassivePoints(event_, {
      upvotesReceived: 0,
      repliesTriggered: 0,
      isDefendingUser: classification.isDefendingUser,
      isSupportiveContext: classification.isSupportiveContext,
      threadSentiment: classification.threadSentiment,
      playerClass,
    });

    if (points !== 0) {
      await addPoints(redis, userId, points);
      await notifyPointsEarned(
        redis,
        userId,
        player.username!,
        playerClass,
        points,
        event_ === 'WARDER_GUARD'
          ? 'Defended someone as a Warder'
          : event_ === 'DEFENSE_REPLY'
            ? 'Defended someone in a comment'
            : event_ === 'SUPPORTIVE_REPLY'
              ? 'Wrote a supportive comment'
              : 'Commented'
      );
    }

    if (parentId) {
      try {
        const isCommentParent = parentId.startsWith('t1_');
        const parentAuthorId = isCommentParent
          ? (await context.reddit.getCommentById(parentId))?.authorId
          : (await context.reddit.getPostById(parentId))?.authorId;

        if (parentAuthorId && parentAuthorId !== userId) {
          const parentPlayer = await getPlayer(redis, parentAuthorId);
          if (parentPlayer?.userId && parentPlayer.class) {
            const parentClass = parentPlayer.class as PlayerClass;
            const replyPoints = calculatePassivePoints('REPLY_RECEIVED', {
              upvotesReceived: 0,
              repliesTriggered: 0,
              isDefendingUser: false,
              isSupportiveContext: false,
              threadSentiment: 'neutral',
              playerClass: parentClass,
            });
            if (replyPoints !== 0) {
              await addPoints(redis, parentAuthorId, replyPoints);
              await notifyPointsEarned(
                redis,
                parentAuthorId,
                parentPlayer.username!,
                parentClass,
                replyPoints,
                'Someone replied to you'
              );
            }
          }
        }
      } catch (err) {
        console.warn('[reddit-events] REPLY_RECEIVED check skipped:', err);
      }
    }

    if (playerClass === 'MENDER') {
      await scheduleDelayedCheck(
        context,
        { action: 'CHECK_COMMENT_SCORE', userId, redditId: commentId },
        COUNSEL_CHECK_DELAY_MS
      );
    }

    if (playerClass === 'WEAVER') {
      await scheduleDelayedCheck(
        context,
        { action: 'CHECK_REPLY_CHAIN', userId, redditId: commentId },
        INSPIRE_CHECK_DELAY_MS
      );
    }
  },
});

Devvit.addTrigger({
  event: 'PostCreate',
  onEvent: async (event, context) => {
    const { redis: predis } = context;
    const redis = asServerRedis(predis);
    const userId = event.post?.authorId;
    const postId = event.post?.id;
    const title = event.post?.title;
    const body = (event.post as any)?.selftext as string | undefined;
    if (!userId || !postId) return;

    const player = await getPlayer(redis, userId);
    if (!player?.userId || !player.class) return;

    const playerClass = player.class as PlayerClass;
    const classification = classifyText(`${title ?? ''} ${body ?? ''}`);

    const points = calculatePassivePoints('POST_CREATED', {
      upvotesReceived: 0,
      repliesTriggered: 0,
      isDefendingUser: classification.isDefendingUser,
      isSupportiveContext: classification.isSupportiveContext,
      threadSentiment: classification.threadSentiment,
      playerClass,
    });

    if (points !== 0) {
      await addPoints(redis, userId, points);
      await notifyPointsEarned(
        redis,
        userId,
        player.username!,
        playerClass,
        points,
        'Created a post'
      );
    }

    if (playerClass === 'WEAVER') {
      await scheduleDelayedCheck(
        context,
        { action: 'CHECK_POST_SCORE', userId, redditId: postId },
        CRAFT_CHECK_DELAY_MS
      );
    }
  },
});
