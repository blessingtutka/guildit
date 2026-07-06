import type { Player, PlayerClass } from '../../../shared/api';
import { CLASS_META } from '../../../shared/web';
import type { AppNotification } from '../../../shared/notification';
import { NotificationBell } from './NotificationBell';
import { PlayerAvatar } from '../common/PlayerAvatar';

type HeaderProps = Readonly<{
  player?: Player | null;
  onBack?: () => void;
  title?: string;
  notifications?: AppNotification[];
  onSelectNotification?: (notification: AppNotification) => void;
  onViewAllNotifications?: () => void;
}>;

const CLASS_COLOR: Record<PlayerClass, string> = {
  RANGER: 'text-ranger',
  MENDER: 'text-mender',
  WARDER: 'text-warder',
  WEAVER: 'text-weaver',
};

export function Header({
  player,
  onBack,
  title,
  notifications = [],
  onSelectNotification,
  onViewAllNotifications,
}: HeaderProps) {
  const meta = player?.class ? CLASS_META[player.class] : null;

  const handleSelectNotification = onSelectNotification ?? (() => undefined);
  const handleViewAllNotifications =
    onViewAllNotifications ?? (() => undefined);

  return (
    <header className="flex items-center gap-3 px-3 py-2.5 border-b border-border bg-card shrink-0">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 shrink-0">
          <img src="/logo.png" alt="Guildit Logo" className="h-7" />
          <span className="font-display text-base font-black tracking-widest text-primary">
            GUILDIT
          </span>
        </div>
      )}

      {title && (
        <span className="font-display text-sm font-bold tracking-wide text-foreground truncate flex-1">
          {title}
        </span>
      )}

      {!title && <div className="flex-1 min-w-0" />}

      <NotificationBell
        notifications={notifications}
        onSelect={handleSelectNotification}
        onViewAll={handleViewAllNotifications}
      />

      {player && meta && (
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden xs:flex flex-col items-end leading-none">
            <span className={`text-xs font-bold ${CLASS_COLOR[player.class!]}`}>
              {meta.name} · Lv.{player.level}
            </span>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {player.points.toLocaleString()} pts
            </span>
          </div>
          <span
            className="xs:hidden text-xs font-bold px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `${meta.color}20`,
              color: meta.color,
            }}
          >
            Lv.{player.level}
          </span>

          <PlayerAvatar player={player} size="sm" showClassBadge />
        </div>
      )}

      {player && !player.class && <PlayerAvatar player={player} size="sm" />}
    </header>
  );
}
