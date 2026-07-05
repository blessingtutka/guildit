import { ProgressBar } from '../common/ProgressBar';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { classColor } from '../../lib/class-colors';
import { CLASS_META } from '../../../shared/web';
import type { Player, PlayerClass } from '../../../shared/api';
import {
  LEVEL_THRESHOLDS,
  MAX_HAND_TUNED_LEVEL,
  POST_CAP_LEVEL_STEP,
} from '../../../shared/api';
import { ClassIcon } from '../common/ClassIcon';

type PlayerHeroCardProps = Readonly<{
  player: Player & { level: number };
  onChangeClass: () => void;
}>;

function nextLevelThreshold(level: number): number {
  if (level < MAX_HAND_TUNED_LEVEL) return LEVEL_THRESHOLDS[level] ?? 0;
  const base = LEVEL_THRESHOLDS[MAX_HAND_TUNED_LEVEL - 1] ?? 4500;
  return base + (level - MAX_HAND_TUNED_LEVEL + 1) * POST_CAP_LEVEL_STEP;
}

function currentLevelThreshold(level: number): number {
  if (level <= 1) return 0;
  if (level <= MAX_HAND_TUNED_LEVEL) return LEVEL_THRESHOLDS[level - 1] ?? 0;
  const base = LEVEL_THRESHOLDS[MAX_HAND_TUNED_LEVEL - 1] ?? 4500;
  return base + (level - MAX_HAND_TUNED_LEVEL) * POST_CAP_LEVEL_STEP;
}

export function PlayerHeroCard({ player, onChangeClass }: PlayerHeroCardProps) {
  const cls = player.class as PlayerClass;
  const meta = CLASS_META[cls];
  const color = classColor(cls);

  const floor = currentLevelThreshold(player.level);
  const ceil = nextLevelThreshold(player.level);
  const xp =
    ceil > floor ? ((player.points - floor) / (ceil - floor)) * 100 : 100;
  const toNext = Math.max(ceil - player.points, 0);

  return (
    <div
      className="relative rounded-2xl overflow-hidden p-4"
      style={{
        background: `linear-gradient(135deg, ${color}18, ${color}05)`,
        border: `1px solid ${color}30`,
      }}
    >
      {/* Change Class button */}
      <Button
        variant="ghost"
        size="xs"
        onClick={onChangeClass}
        className="absolute top-3 right-3 text-xs text-muted-foreground"
      >
        ✦ Change class
      </Button>

      <div className="flex items-center gap-4 pr-16">
        {/* Avatar stack: avatar + class image badge */}
        <div className="relative shrink-0">
          <PlayerAvatar player={player} size="lg" className="z-10" />
          {meta.image && (
            <img
              src={`/images/${meta.image}`}
              alt={meta.name}
              className="absolute -bottom-2 -right-2 w-9 h-9 object-contain z-20 drop-shadow-lg"
            />
          )}
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-0 pt-1">
          <p
            className="font-display text-base font-bold leading-tight truncate"
            style={{ color }}
          >
            {player.username}
          </p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-bold flex items-center gap-0.5"
              style={{ borderColor: `${color}60`, color }}
            >
              <ClassIcon classMeta={meta} />
              {meta.name}
            </Badge>
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 font-bold"
            >
              Lv.{player.level}
            </Badge>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {player.points.toLocaleString()} pts
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar value={xp} color={color} animated />
            <p className="text-[10px] text-muted-foreground mt-1">
              {toNext.toLocaleString()} pts → Lv.{player.level + 1}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
