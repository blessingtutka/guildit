import { Devvit, RedisClient } from '@devvit/public-api';

async function getPlayerClass(redis: RedisClient, userId: string) {
  const cls = await redis.hGet(`player:${userId}`, 'class');
  return cls || null;
}

async function logPointEvent(
  _redis: RedisClient,
  _userId: string,
  _event: string,
  _meta: object
) {
  // TODO: Day 4
}

Devvit.addTrigger({
  event: 'CommentCreate',
  onEvent: async (event, context) => {
    const { redis } = context;
    const userId = event.comment?.author;
    if (!userId) return;

    const playerClass = await getPlayerClass(redis, userId);
    if (!playerClass) return;

    await logPointEvent(redis, userId, 'COMMENT_CREATED', {
      upvotesReceived: 0,
      repliesTriggered: 0,
      isDefendingUser: false,
      isSupportiveContext: false,
      threadSentiment: 'neutral',
      playerClass,
    });
  },
});

Devvit.addTrigger({
  event: 'PostCreate',
  onEvent: async (event, context) => {
    const { redis } = context;
    const userId = event.post?.authorId;
    if (!userId) return;

    const playerClass = await getPlayerClass(redis, userId);
    if (!playerClass) return;

    await logPointEvent(redis, userId, 'POST_CREATED', {
      upvotesReceived: 0,
      repliesTriggered: 0,
      isDefendingUser: false,
      isSupportiveContext: false,
      threadSentiment: 'neutral',
      playerClass,
    });
  },
});
