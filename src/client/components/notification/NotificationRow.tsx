import { Clock } from 'lucide-react';
import { timeAgo } from '../../lib/time-utils';
import type { AppNotification } from '../../../shared/notification';

interface NotificationRowProps {
  notification: AppNotification;
  onClick: () => void;
  busy: boolean;
}

export function NotificationRow({
  notification,
  onClick,
  busy,
}: NotificationRowProps) {
  const { title, subtitle, avatarInitial, avatarColor, read, createdAt } =
    notification;

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`w-full flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:border-muted-foreground/30 transition-colors text-left ${
        read ? '' : 'border-l-4 border-l-primary'
      } ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Unread dot */}
      {!read && (
        <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
      )}
      {read && <div className="size-2 shrink-0" />}

      {/* Avatar */}
      <div
        className="size-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
        style={{ backgroundColor: `${avatarColor}20`, color: avatarColor }}
      >
        {avatarInitial?.toUpperCase() ?? '?'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          {timeAgo(createdAt)}
        </p>
      </div>

      {/* Busy indicator */}
      {busy && <Clock className="size-4 text-muted-foreground shrink-0" />}
    </button>
  );
}
