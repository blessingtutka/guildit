import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { CLASS_META } from '../../../shared/web';
import type { Player, PlayerClass } from '../../../shared/api';
import { cn } from '../../lib/utils';
import { ClassIcon } from './ClassIcon';

type PlayerAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type PlayerAvatarProps = Readonly<{
  player: Pick<Player, 'username' | 'class' | 'snoovatar'>;
  size?: PlayerAvatarSize;
  showClassBadge?: boolean;
  className?: string;
}>;

const SIZE_CLASSES: Record<PlayerAvatarSize, string> = {
  sm: 'size-7',
  md: 'size-10',
  lg: 'size-16',
  xl: 'size-24',
};

const BADGE_SIZE_CLASSES: Record<PlayerAvatarSize, string> = {
  sm: 'size-3.5 text-[8px]',
  md: 'size-5 text-xs',
  lg: 'size-7 text-base',
  xl: 'size-10 text-xl',
};

const CLASS_COLORS: Record<PlayerClass, string> = {
  RANGER: 'var(--color-ranger)',
  MENDER: 'var(--color-mender)',
  WARDER: 'var(--color-warder)',
  WEAVER: 'var(--color-weaver)',
};

export function PlayerAvatar({
  player,
  size = 'md',
  showClassBadge = false,
  className,
}: PlayerAvatarProps) {
  const initials = (player.username ?? 'A').slice(0, 2).toUpperCase();

  const cls = player.class as PlayerClass | null;
  const classMeta = cls ? CLASS_META[cls] : null;
  const classColor = cls ? CLASS_COLORS[cls] : undefined;

  return (
    <div className={cn('relative shrink-0', className)}>
      <Avatar
        className={cn(
          SIZE_CLASSES[size],
          'ring-2 ring-background',
          cls && size !== 'sm' ? 'ring-offset-1 ring-offset-background' : ''
        )}
        style={cls ? { outline: `2px solid ${classColor}50` } : {}}
      >
        <AvatarImage
          src={player.snoovatar ?? undefined}
          alt={player.username ?? 'Player'}
        />
        <AvatarFallback
          className="font-bold text-muted-foreground"
          style={
            cls ? { backgroundColor: `${classColor}20`, color: classColor } : {}
          }
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Class badge pinned to bottom-right */}
      {showClassBadge && classMeta && (
        <span
          className={cn(
            'absolute -bottom-1 -right-1 z-10 flex items-center justify-center rounded-full ring-2 ring-background',
            BADGE_SIZE_CLASSES[size]
          )}
          style={{
            backgroundColor: `${classColor}25`,
            border: `1.5px solid ${classColor}80`,
          }}
          title={classMeta.name}
        >
          <ClassIcon classMeta={classMeta} />
        </span>
      )}
    </div>
  );
}
