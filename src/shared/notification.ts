export type NotificationType =
  | 'duel_invite'
  | 'duel_accepted'
  | 'duel_declined'
  | 'guild_invite'
  | 'guild_joined'
  | 'level_up'
  | 'raid_result';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  subtitle?: string;
  createdAt: number;
  avatarInitial: string;
  avatarColor: string;
  read: boolean;
  payload: unknown;
}

export interface CreateNotificationInput {
  userId: string; // who receives it
  type: NotificationType;
  title: string;
  subtitle?: string;
  avatarInitial: string;
  avatarColor: string;
  payload: unknown;
}
