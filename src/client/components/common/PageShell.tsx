import type React from 'react';
import { Header } from '../layout/Header';
import type { Player } from '../../../shared/api';

type PageShellProps = Readonly<{
  player?: Player | null;
  onBack?: () => void;
  title?: string;
  children: React.ReactNode;
  /** Extra element to render in fixed position above content (e.g. toasts) */
  overlay?: React.ReactNode;
}>;

/**
 * Standard full-height page wrapper: Header + scrollable body + optional overlay slot.
 */
export function PageShell({ player, onBack, title, children, overlay }: PageShellProps) {
  return (
    <div className="flex flex-col w-full h-full bg-background overflow-hidden">
      <Header
        {...(player !== undefined ? { player: player ?? null } : {})}
        {...(onBack !== undefined ? { onBack } : {})}
        {...(title !== undefined ? { title } : {})}
      />
      {overlay}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
