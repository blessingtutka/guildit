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
  const channel = userChannel(userId);

  console.log(`[Realtime] Sending to ${channel}`);

  try {
    await realtime.send(channel, event);

    console.log(`[Realtime] Sent to ${channel}`);
  } catch (err) {
    console.error(`[Realtime] Failed sending to ${channel}`, err);
  }
}
