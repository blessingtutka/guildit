export interface DelayedCheckPayload {
  action: 'CHECK_POST_SCORE' | 'CHECK_COMMENT_SCORE';
  userId: string;
  redditId: string;
  [key: string]: string;
}

export async function scheduleDelayedCheck(
  context: any,
  payload: DelayedCheckPayload,
  delayMs: number
): Promise<void> {
  try {
    if (!context.scheduler || typeof context.scheduler.runJob !== 'function') {
      console.warn(
        '[scheduler] context.scheduler.runJob not found — verify the real ' +
          'API in node_modules and update scheduler.ts to match.'
      );
      return;
    }

    await context.scheduler.runJob({
      name: 'delayedScoreCheck',
      data: payload,
      runAt: new Date(Date.now() + delayMs),
    });
  } catch (err) {
    console.warn('[scheduler] Failed to schedule delayed check:', err);
  }
}
