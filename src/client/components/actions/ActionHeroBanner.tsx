import { CLASS_META } from '../../../shared/web';
import type { Player, PlayerClass } from '../../../shared/api';

type ActionHeroBannerProps = Readonly<{
  player: Player & { level: number };
  color: string;
}>;

export function ActionHeroBanner({
  player,

  color,
}: ActionHeroBannerProps) {
  const meta = CLASS_META[player.class as PlayerClass];

  return (
    <div
      className="rounded-2xl p-5 text-center"
      style={{
        background: `linear-gradient(135deg, ${color}22, ${color}06)`,
        border: `1px solid ${color}`,
      }}
    >
      <div className="flex flex-col items-center gap-2">
        {meta.image && (
          <img
            src={`/images/${meta.image}`}
            alt={meta.name}
            className="h-16 w-16 object-contain animate-bounce-subtle"
          />
        )}
        <p
          className="font-display text-xl font-bold tracking-wide"
          style={{ color }}
        >
          {meta.name}
        </p>
        <p className="text-xs text-muted-foreground italic">{meta.tagline}</p>
      </div>
    </div>
  );
}
