import { Badge } from '../ui/badge';
import type { GuildStatus } from '../../../shared/api';
import { Landmark, MoveRight, Swords, X } from 'lucide-react';

type GuildStatusCardProps = Readonly<{
  guild: GuildStatus | null;
  color: string;
  onNavigate: () => void;
}>;

export function GuildStatusCard({
  guild,
  color,
  onNavigate,
}: GuildStatusCardProps) {
  if (guild) {
    return (
      <button
        type="button"
        onClick={onNavigate}
        className="flex items-center justify-between w-full bg-card border border-border rounded-xl px-4 py-3 text-left hover:bg-secondary transition-colors group"
      >
        <div className="flex items-center gap-3">
          <Swords className="size-6 text-foreground" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {guild.guild.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {guild.members.length} members
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 font-bold"
                style={{ color }}
              >
                <X className="size-2" /> {guild.multiplier.toFixed(1)}
              </Badge>
              {guild.isComplete && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                  style={{ borderColor: `${color}60`, color }}
                >
                  <Swords className="size-6 text-foreground" /> Full
                </Badge>
              )}
            </div>
          </div>
        </div>
        <MoveRight className="text-muted-foreground group-hover:text-foreground transition-colors text-sm" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onNavigate}
      className="flex items-center justify-between w-full bg-card border border-dashed border-border rounded-xl px-4 py-3 text-left hover:bg-secondary transition-colors group"
    >
      <div className="flex items-center gap-3">
        <Landmark className="size-6 text-foreground" />
        <div>
          <p className="text-sm font-semibold text-foreground">No Guild</p>
          <p className="text-xs text-muted-foreground">
            Join or found one to earn multiplied points
          </p>
        </div>
      </div>
      <span
        className="text-xs font-semibold flex items-center gap-0.5 shrink-0"
        style={{ color }}
      >
        Join <MoveRight className="size-3" />
      </span>
    </button>
  );
}
