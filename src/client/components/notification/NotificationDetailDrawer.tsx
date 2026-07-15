import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '../ui/drawer';
import { Button } from '../ui/button';
import {
  Check,
  X,
  Ban,
  Swords,
  Users,
  Trophy,
  Star,
  Shield,
  Coins,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { timeAgo } from '../../lib/time-utils';
import type {
  AppNotification,
  NotificationType,
} from '../../../shared/notification';

type NotificationDetailDrawerProps = Readonly<{
  notification: AppNotification | null;
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  userId?: string | null;
}>;

const TYPE_LABEL: Record<NotificationType, string> = {
  duel_invite: 'Duel Invite',
  duel_accepted: 'Duel Accepted',
  duel_declined: 'Duel Declined',
  guild_invite: 'Guild Invite',
  guild_joined: 'Guild Joined',
  level_up: 'Level Up',
  raid_result: 'Raid Result',
  points_earned: 'Points Earned',
};

const STATUS_LABEL: Record<NotificationType, string> = {
  duel_invite: 'Awaiting response',
  duel_accepted: 'Accepted',
  duel_declined: 'Declined',
  guild_invite: 'Awaiting response',
  guild_joined: 'Joined',
  level_up: 'Completed',
  raid_result: 'Completed',
  points_earned: 'Earned',
};

export function NotificationDetailDrawer({
  notification,
  open,
  busy,
  onClose,
  onDelete,
  userId,
}: NotificationDetailDrawerProps) {
  const navigate = useNavigate();
  if (!notification) return null;

  const {
    id,
    type,
    title,
    subtitle,
    avatarInitial,
    avatarColor,
    createdAt,
    read,
    payload,
  } = notification;

  const getIcon = () => {
    const className = 'size-5';
    switch (type) {
      case 'duel_invite':
        return <Swords className={className} />;
      case 'duel_accepted':
        return <Check className={className} />;
      case 'duel_declined':
        return <X className={className} />;
      case 'guild_invite':
      case 'guild_joined':
        return <Users className={className} />;
      case 'level_up':
        return <Star className={className} />;
      case 'raid_result':
        return <Trophy className={className} />;
      case 'points_earned':
        return <Coins className={className} />;
      default:
        return <Shield className={className} />;
    }
  };

  const getPointsEarned = () => {
    if (type !== 'points_earned') return null;
    const points = (payload as any)?.points ?? (payload as any)?.amount ?? 0;
    return points;
  };

  const renderActions = () => {
    switch (type) {
      case 'duel_invite':
        return (
          <div className="flex gap-2 w-full">
            <Button
              onClick={async () => {
                if (!userId) return;
                try {
                  const inviteId =
                    (payload as any)?.inviteId ??
                    (payload as any)?.invite?.inviteId;
                  if (!inviteId) return onClose();

                  const res = await fetch(
                    `/api/duel/invite/${inviteId}/accept`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId }),
                    }
                  );
                  const data = await res.json().catch(() => null);
                  const duelId = data?.duelId ?? data?.duel?.duelId ?? null;
                  if (duelId) {
                    void navigate(`/duel?open=${encodeURIComponent(duelId)}`);
                  }
                  onClose();
                } catch (err) {
                  console.error('Accept invite failed', err);
                }
              }}
              disabled={busy}
              className="flex-1 h-9 text-sm font-medium text-white flex items-center justify-center gap-1.5"
              style={{ backgroundColor: avatarColor, border: 'none' }}
            >
              <Check className="size-3.5" />
              {busy ? 'Accepting...' : 'Accept'}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                if (!userId) return;
                try {
                  const inviteId =
                    (payload as any)?.inviteId ??
                    (payload as any)?.invite?.inviteId;
                  if (!inviteId) return onClose();

                  await fetch(`/api/duel/invite/${inviteId}/decline`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                  });
                  onClose();
                } catch (err) {
                  console.error('Decline invite failed', err);
                }
              }}
              disabled={busy}
              className="flex-1 h-9 text-sm flex items-center justify-center gap-1.5"
            >
              <X className="size-3.5" />
              Decline
            </Button>
          </div>
        );

      case 'duel_accepted':
        return (
          <Button
            onClick={() => {
              const duelId = (payload as any)?.duelId ?? null;
              if (duelId) {
                void navigate(`/duel?open=${encodeURIComponent(duelId)}`);
              }
              onClose();
            }}
            className="w-full h-9 text-sm font-medium flex items-center justify-center gap-1.5"
            style={{ backgroundColor: avatarColor, border: 'none' }}
          >
            <Swords className="size-3.5" />
            View Duel
          </Button>
        );

      case 'duel_declined':
        return (
          <Button
            variant="outline"
            onClick={() => onDelete(id)}
            className="w-full h-9 text-sm flex items-center justify-center gap-1.5"
          >
            <Ban className="size-3.5" />
            Dismiss
          </Button>
        );

      case 'points_earned':
        return (
          <Button
            onClick={onClose}
            className="w-full h-9 text-sm font-medium flex items-center justify-center gap-1.5"
            style={{ backgroundColor: avatarColor, border: 'none' }}
          >
            <Zap className="size-3.5" />
            Continue
          </Button>
        );

      case 'level_up':
        return (
          <Button
            onClick={onClose}
            className="w-full h-9 text-sm font-medium flex items-center justify-center gap-1.5"
            style={{ backgroundColor: avatarColor, border: 'none' }}
          >
            <Star className="size-3.5" />
            Continue
          </Button>
        );

      case 'raid_result':
        return (
          <Button
            onClick={() => {
              const raidId = (payload as any)?.raidId ?? null;
              if (raidId) {
                void navigate(`/raid/${raidId}`);
              }
              onClose();
            }}
            className="w-full h-9 text-sm font-medium flex items-center justify-center gap-1.5"
            style={{ backgroundColor: avatarColor, border: 'none' }}
          >
            <Trophy className="size-3.5" />
            View Report
          </Button>
        );

      case 'guild_invite':
        return (
          <div className="flex gap-2 w-full">
            <Button
              onClick={() => {
                const guildId = (payload as any)?.guildId ?? null;
                if (guildId) {
                  void navigate(`/guild/${guildId}`);
                }
                onClose();
              }}
              disabled={busy}
              className="flex-1 h-9 text-sm font-medium text-white flex items-center justify-center gap-1.5"
              style={{ backgroundColor: avatarColor, border: 'none' }}
            >
              <Check className="size-3.5" />
              Accept
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onClose();
              }}
              disabled={busy}
              className="flex-1 h-9 text-sm flex items-center justify-center gap-1.5"
            >
              <X className="size-3.5" />
              Decline
            </Button>
          </div>
        );

      case 'guild_joined':
        return (
          <Button
            onClick={() => {
              const guildId = (payload as any)?.guildId ?? null;
              if (guildId) {
                void navigate(`/guild/${guildId}`);
              }
              onClose();
            }}
            className="w-full h-9 text-sm font-medium flex items-center justify-center gap-1.5"
            style={{ backgroundColor: avatarColor, border: 'none' }}
          >
            <Users className="size-3.5" />
            View Guild
          </Button>
        );

      default:
        return (
          <Button
            variant="outline"
            onClick={() => onDelete(id)}
            className="w-full h-9 text-sm flex items-center justify-center gap-1.5"
          >
            <Ban className="size-3.5" />
            Dismiss This
          </Button>
        );
    }
  };

  const pointsEarned = getPointsEarned();
  const Icon = getIcon();

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="font-display tracking-widest text-base">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-xs text-muted-foreground">
            {read ? 'Read' : 'Unread'} · {STATUS_LABEL[type] || type}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-3 flex flex-col items-center gap-2.5">
          {/* Avatar with initial and icon overlay */}
          <div className="relative">
            <div
              className="size-14 rounded-full flex items-center justify-center font-bold text-xl"
              style={{
                backgroundColor: `${avatarColor}20`,
                color: avatarColor,
              }}
            >
              {avatarInitial?.toUpperCase() ?? '?'}
            </div>
            {/* Icon badge overlay */}
            <div
              className="absolute -bottom-1 -right-1 size-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: avatarColor }}
            >
              <div className="text-white size-4">{Icon}</div>
            </div>
          </div>

          <div className="text-center">
            <p className="font-semibold text-sm text-foreground">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
            {type === 'points_earned' && pointsEarned !== null && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                <Coins className="size-3.5" />+{pointsEarned} points
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-2">
          <div className="border-t border-border pt-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Received</span>
                <span>{new Date(createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time ago</span>
                <span>{timeAgo(createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span>{TYPE_LABEL[type] || type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={
                    read
                      ? 'text-muted-foreground'
                      : 'text-primary font-semibold'
                  }
                >
                  {read ? 'Read' : 'Unread'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="pt-2 pb-3">
          {renderActions()}
          <Button
            variant="ghost"
            onClick={() => onDelete(id)}
            disabled={busy}
            className="w-full h-8 text-xs text-muted-foreground hover:text-destructive"
          >
            <Ban className="size-3.5 mr-1.5" />
            Remove
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
