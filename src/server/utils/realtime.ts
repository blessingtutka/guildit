import { realtime } from '@devvit/web/server';
import { JsonValue } from '@devvit/web/shared';

export function userChannel(userId: string): string {
  return `user_${userId}_notifications`;
}

// publishToUser
export async function publishToUser(
  userId: string,
  event: JsonValue
): Promise<void> {
  try {
    await realtime.send(userChannel(userId), event);
  } catch (err) {
    console.warn(
      '[realtime] publishToUser failed, continuing without push:',
      err
    );
  }
}
