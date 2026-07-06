import { Bell, ChevronRight } from 'lucide-react';
import type { AppNotification } from '../../../shared/notification';
import { timeAgo } from '../../lib/time-utils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NotificationBellProps = Readonly<{
  notifications: AppNotification[];
  onSelect: (notification: AppNotification) => void;
  onViewAll: () => void;
}>;

export function NotificationBell({
  notifications,
  onSelect,
  onViewAll,
}: NotificationBellProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Get the latest notification (most recent)
  const latestNotification =
    notifications.length > 0
      ? notifications.reduce((latest, current) =>
          current.createdAt > latest.createdAt ? current : latest
        )
      : null;

  // Get recent notifications
  const recentNotifications = [...notifications]
    .sort((a, b) => b.createdAt - a.createdAt)
    .filter((n) => (latestNotification ? n.id !== latestNotification.id : true))
    .slice(0, 4); // Show 4 recent + 1 latest = 5 total

  const hasNotifications = notifications.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />

          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={12}
        className="z-120 w-[min(320px,calc(100vw-24px))] p-0 overflow-hidden"
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <DropdownMenuSeparator />

        <div className="max-h-72 overflow-y-auto">
          {hasNotifications ? (
            <>
              {/* Latest notification - prominently displayed */}
              {latestNotification && (
                <div className="px-2 py-2">
                  <div className="text-[10px] text-muted-foreground/60 px-2 mb-1 font-medium uppercase tracking-wider">
                    Latest
                  </div>
                  <DropdownMenuItem
                    onClick={() => onSelect(latestNotification)}
                    className="cursor-pointer items-start gap-3 px-3 py-3 mx-0 rounded-lg bg-primary/5 hover:bg-primary/10! transition-colors border border-primary/20"
                  >
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold border-2"
                      style={{
                        backgroundColor: `${latestNotification.avatarColor}20`,
                        color: latestNotification.avatarColor,
                        borderColor: latestNotification.avatarColor,
                      }}
                    >
                      {latestNotification.avatarInitial?.toUpperCase() ?? '?'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">
                        {latestNotification.title}
                      </p>
                      {latestNotification.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">
                          {latestNotification.subtitle}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {timeAgo(latestNotification.createdAt)}
                      </p>
                    </div>
                    {!latestNotification.read && (
                      <div className="size-2 rounded-full bg-primary shrink-0 mt-1" />
                    )}
                  </DropdownMenuItem>
                </div>
              )}

              {/* Recent notifications */}
              {recentNotifications.length > 0 && (
                <div className="px-2 pb-2">
                  {latestNotification && (
                    <div className="text-[10px] text-muted-foreground/60 px-2 mb-1 font-medium uppercase tracking-wider">
                      Recent
                    </div>
                  )}
                  {recentNotifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => onSelect(notification)}
                      className="cursor-pointer items-start gap-3 px-3 py-2.5 mx-0 rounded-lg hover:bg-secondary! transition-colors"
                    >
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold border border-border"
                        style={{
                          backgroundColor: `${notification.avatarColor}20`,
                          color: notification.avatarColor,
                          borderColor: `${notification.avatarColor}40`,
                        }}
                      >
                        {notification.avatarInitial?.toUpperCase() ?? '?'}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm ${notification.read ? 'font-medium' : 'font-semibold'}`}
                        >
                          {notification.title}
                        </p>
                        {notification.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">
                            {notification.subtitle}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center">
              <Bell
                className="size-8 text-muted-foreground/50 mx-auto mb-2"
                strokeWidth={1.5}
              />
              <p className="text-sm text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                You'll see them here when they arrive
              </p>
            </div>
          )}
        </div>

        {hasNotifications && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onViewAll()}
              className="cursor-pointer justify-center gap-1 py-3 mx-2 mb-2 px-2 font-medium text-primary hover:bg-secondary! transition-colors"
            >
              View All
              <ChevronRight className="size-4" />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
