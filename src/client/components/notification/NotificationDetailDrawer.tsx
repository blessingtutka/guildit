/* eslint-disable @typescript-eslint/no-explicit-any */
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
};

const STATUS_LABEL: Record<NotificationType, string> = {
  duel_invite: 'Awaiting response',
  duel_accepted: 'Accepted',
  duel_declined: 'Declined',
  guild_invite: 'Awaiting response',
  guild_joined: 'Joined',
  level_up: 'Completed',
  raid_result: 'Completed',
};

export function NotificationDetailDrawer({
  notification,
  open,
  busy,
  onClose,
  onDelete,
  userId,
}: NotificationDetailDrawerProps & { userId?: string | null }) {
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
  } = notification;

  const getIcon = () => {
    switch (type) {
      case 'duel_invite':
        return <Swords className="size-6" />;
      case 'duel_accepted':
        return <Check className="size-6" />;
      case 'duel_declined':
        return <X className="size-6" />;
      case 'guild_invite':
      case 'guild_joined':
        return <Users className="size-6" />;
      case 'level_up':
        return <Star className="size-6" />;
      case 'raid_result':
        return <Trophy className="size-6" />;
      default:
        return <Shield className="size-6" />;
    }
  };

  const renderActions = () => {
    switch (type) {
      case 'duel_invite':
        return (
          <>
            <Button
              onClick={async () => {
                if (!userId) return;
                try {
                  const payload = notification.payload as any;
                  const inviteId =
                    payload?.inviteId ?? payload?.invite?.inviteId;
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
              className="flex-1 font-bold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: avatarColor, border: 'none' }}
            >
              <Check className="size-4" />
              {busy ? 'Accepting...' : 'Accept Challenge'}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                if (!userId) return;
                try {
                  const payload = notification.payload as any;
                  const inviteId =
                    payload?.inviteId ?? payload?.invite?.inviteId;
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
              className="flex-1 flex items-center justify-center gap-2"
            >
              <X className="size-4" />
              Decline
            </Button>
          </>
        );
      case 'duel_accepted':
        return (
          <Button
            onClick={() => {
              // Navigate to duel
              onClose();
            }}
            className="flex-1 font-bold"
          >
            <Swords className="size-4 mr-2" />
            View Duel
          </Button>
        );
      case 'duel_declined':
        return (
          <Button
            variant="outline"
            onClick={() => onDelete(id)}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Ban className="size-4" />
            Dismiss
          </Button>
        );
      case 'guild_invite':
        return (
          <>
            <Button
              onClick={() => {
                // Handle accept
                onClose();
              }}
              className="flex-1 font-bold"
            >
              <Check className="size-4 mr-2" />
              Accept Invite
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Handle decline
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <X className="size-4" />
              Decline
            </Button>
          </>
        );
      case 'guild_joined':
        return (
          <Button
            onClick={() => {
              // Navigate to guild
              onClose();
            }}
            className="flex-1 font-bold"
          >
            <Users className="size-4 mr-2" />
            View Guild
          </Button>
        );
      case 'level_up':
        return (
          <Button onClick={onClose} className="flex-1 font-bold">
            <Star className="size-4 mr-2" />
            Continue
          </Button>
        );
      case 'raid_result':
        return (
          <Button
            onClick={() => {
              // Navigate to raid report
              onClose();
            }}
            className="flex-1 font-bold"
          >
            <Trophy className="size-4 mr-2" />
            View Report
          </Button>
        );
      default:
        return (
          <Button
            variant="outline"
            onClick={() => onDelete(id)}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Ban className="size-4" />
            Dismiss
          </Button>
        );
    }
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle className="font-display tracking-widest text-lg">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-xs">
            {read ? 'Read' : 'Unread'} · {STATUS_LABEL[type] || type}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-4 flex flex-col items-center gap-3">
          <div
            className="size-16 rounded-full flex items-center justify-center font-bold text-xl"
            style={{ backgroundColor: `${avatarColor}20`, color: avatarColor }}
          >
            {avatarInitial?.toUpperCase() ?? '?'}
          </div>
          <div className="text-center">
            <p className="font-semibold text-base text-foreground">{title}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="px-6 pb-2">
          <div className="border-t border-border pt-4">
            <div className="space-y-2 text-sm">
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

        <DrawerFooter className="pt-2">
          {renderActions()}
          <Button
            variant="ghost"
            onClick={() => onDelete(id)}
            disabled={busy}
            className="w-full text-muted-foreground hover:text-destructive"
          >
            <Ban className="size-4 mr-2" />
            Remove Notification
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
