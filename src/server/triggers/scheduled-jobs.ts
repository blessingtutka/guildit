import { Devvit } from '@devvit/public-api';
import { logAction } from '../services/action.service';
import type { DelayedCheckPayload } from '../utils/scheduler';
import type { RedisClient as TriggerRedis } from '@devvit/public-api';
import type { RedisClient } from '@devvit/web/server';

export function asServerRedis(redis: TriggerRedis): RedisClient {
  return redis as unknown as RedisClient;
}

const CRAFT_SCORE_THRESHOLD = 25;
const COUNSEL_SCORE_THRESHOLD = 10;
const INSPIRE_REPLY_THRESHOLD = 5;

Devvit.addSchedulerJob<DelayedCheckPayload>({
  name: 'delayedScoreCheck',
  onRun: async (event, context) => {
    const { redis: predis, reddit } = context;
    const redis = asServerRedis(predis);
    const { action, userId, redditId } = event.data;

    try {
      if (action === 'CHECK_POST_SCORE') {
        const post = await reddit.getPostById(redditId);
        if (post && post.score >= CRAFT_SCORE_THRESHOLD) {
          await logAction(redis, userId, 'WEAVER_CRAFT');
        }
      }

      if (action === 'CHECK_COMMENT_SCORE') {
        const comment = await reddit.getCommentById(redditId);
        if (comment && comment.score >= COUNSEL_SCORE_THRESHOLD) {
          await logAction(redis, userId, 'MENDER_COUNSEL');
        }
      }

      if (action === 'CHECK_REPLY_CHAIN') {
        const comment = await reddit.getCommentById(redditId);
        const replyCount = (comment as any)?.numReplies ?? 0;
        if (replyCount >= INSPIRE_REPLY_THRESHOLD) {
          await logAction(redis, userId, 'WEAVER_INSPIRE', {
            systemVerified: true,
          });
        }
      }
    } catch (err) {
      console.warn('[scheduled-jobs] delayedScoreCheck skipped:', err);
    }
  },
});
