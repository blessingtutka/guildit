import { useCallback } from 'react';
import { context } from '@devvit/web/client';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../layout/Header';
import type { Player } from '../../../shared/api';
import type { AppNotification } from '../../../shared/notification';
import { useNotifications } from '../../hooks/Usenotifications';

type PageShellProps = Readonly<{
  player?: Player | null;
  onBack?: () => void;
  title?: string;
  children: ReactNode;
  overlay?: ReactNode;
  notifications?: AppNotification[];
  onSelectNotification?: (notification: AppNotification) => void;
  onViewAllNotifications?: () => void;
}>;

export function PageShell({
  player,
  onBack,
  title,
  children,
  overlay,
  notifications,
  onSelectNotification,
  onViewAllNotifications,
}: PageShellProps) {
  const navigate = useNavigate();

  // If the parent didn't provide notifications, use the global hook so the
  // header always shows notifications across the app.
  const userId = player?.userId ?? context.userId ?? null;
  const notifHook = useNotifications(userId);
  const effectiveNotifications = notifications ?? notifHook.notifications;

  const handleSelectNotification = useCallback(
    async (n: AppNotification) => {
      try {
        await notifHook.markAsRead?.(n.id);
      } catch (err) {
        // ignore
      }

      // If this notification points to a duel, navigate to duel and include
      // the duel id in the query so DuelPage can open it.
      const payload: any = n.payload ?? {};
      const duelId = payload?.duelId ?? payload?.invite?.duelId ?? null;
      if (duelId) {
        void navigate(`/duel?open=${encodeURIComponent(duelId)}`);
        return;
      }

      void onSelectNotification?.(n);
    },
    [notifHook, navigate, onSelectNotification]
  );

  const handleViewAll = useCallback(() => {
    if (onViewAllNotifications) return onViewAllNotifications();
    void navigate('/notifications');
  }, [navigate, onViewAllNotifications]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      <Header
        {...(player === undefined ? {} : { player: player ?? null })}
        {...(onBack === undefined ? {} : { onBack })}
        {...(title === undefined ? {} : { title })}
        notifications={effectiveNotifications}
        onSelectNotification={handleSelectNotification}
        onViewAllNotifications={handleViewAll}
      />
      {overlay}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {children}
      </div>
    </div>
  );
}
