import type { ReactNode } from 'react';
import { Header } from '../layout/Header';
import type { Player } from '../../../shared/api';

type PageShellProps = Readonly<{
  player?: Player | null;
  onBack?: () => void;
  title?: string;
  children: ReactNode;
  overlay?: ReactNode;
  notifications?: import('../../../shared/web').AppNotification[];
  onSelectNotification?: (
    notification: import('../../../shared/web').AppNotification
  ) => void;
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
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      <Header
        {...(player === undefined ? {} : { player: player ?? null })}
        {...(onBack === undefined ? {} : { onBack })}
        {...(title === undefined ? {} : { title })}
        {...(notifications === undefined ? {} : { notifications })}
        {...(onSelectNotification === undefined
          ? {}
          : { onSelectNotification })}
        {...(onViewAllNotifications === undefined
          ? {}
          : { onViewAllNotifications })}
      />
      {overlay}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {children}
      </div>
    </div>
  );
}
