import { Bell, ChevronRight } from 'lucide-react';
import type { AppNotification } from '../../../shared/web';

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
  const recent = [...notifications]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />

          {notifications.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-[calc(100vw-24px)] max-w-80 p-0 overflow-hidden"
      >
        <DropdownMenuLabel className="px-4 py-3">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-72 overflow-y-auto">
          {recent.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Nothing new
            </div>
          ) : (
            recent.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => onSelect(notification)}
                className="cursor-pointer items-start gap-3 px-4 py-3"
              >
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${notification.avatarColor}20`,
                    color: notification.avatarColor,
                  }}
                >
                  {notification.avatarInitial}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {notification.title}
                  </p>

                  {notification.subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {notification.subtitle}
                    </p>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onViewAll}
          className="cursor-pointer justify-center gap-1 py-3 font-medium text-primary"
        >
          View All
          <ChevronRight className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
