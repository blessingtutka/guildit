import { Separator } from '../ui/separator';
import { CLASS_META } from '../../../shared/web';
import { CLASS_COLORS } from '../../lib/class-colors';
import type { Player, PlayerClass, GuildStatus } from '../../../shared/api';
import { ClassIcon } from '../common/ClassIcon';
import { Landmark } from 'lucide-react';

const ALL_CLASSES: PlayerClass[] = ['RANGER', 'MENDER', 'WARDER', 'WEAVER'];

type MyGuildViewProps = Readonly<{
  guild: GuildStatus;
  player: Player & { level: number };
  playerColor: string;
  leaving: boolean;
  onLeave: () => void;
}>;

export function MyGuildView({
  guild,
  player,
  playerColor,
  leaving,
  onLeave,
}: MyGuildViewProps) {
  return (
    <div className="flex flex-col flex-1 px-4 py-4 gap-4 overflow-y-auto">
      {/* Guild Header */}
      <div className="bg-card border border-border rounded-2xl p-5 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `radial-gradient(ellipse at center, ${playerColor}, transparent 70%)`,
          }}
        />
        <p className="relative text-xs text-muted-foreground uppercase tracking-widest mb-1">
          Your Guild
        </p>
        <h2 className="relative font-display text-2xl font-bold tracking-wide text-foreground mb-1">
          {guild.guild.name}
        </h2>
        <p
          className="relative text-sm font-bold"
          style={{ color: playerColor }}
        >
          {guild.guildScore.toLocaleString()} pts · ×
          {guild.multiplier.toFixed(1)} multiplier
        </p>
        {guild.isComplete && (
          <span className="relative mt-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <Landmark className="size-3" /> COMPLETE GUILD
          </span>
        )}
      </div>

      <Separator />

      {/* Class Roster */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Class Roster
        </p>
        <div className="grid grid-cols-4 gap-2">
          {ALL_CLASSES.map((cls) => {
            const present = guild.classesPresent.includes(cls);
            const meta = CLASS_META[cls];
            const clsColor = CLASS_COLORS[cls];
            return (
              <div
                key={cls}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  present
                    ? 'border-opacity-60 bg-opacity-10'
                    : 'border-border opacity-35'
                }`}
                style={
                  present
                    ? {
                        borderColor: clsColor,
                        backgroundColor: `${clsColor}15`,
                      }
                    : {}
                }
              >
                <ClassIcon classMeta={meta} className="size-5" />
                <span
                  className="text-xs font-bold"
                  style={present ? { color: clsColor } : {}}
                >
                  {meta.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {present ? '✓' : '—'}
                </span>
              </div>
            );
          })}
        </div>
        {!guild.isComplete && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Recruit a{' '}
            {ALL_CLASSES.filter((c) => !guild.classesPresent.includes(c))
              .map((c) => CLASS_META[c].name)
              .join(', ')}{' '}
            to unlock full multiplier
          </p>
        )}
      </div>

      <Separator />

      {/* Members */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Members ({guild.members.length})
        </p>
        <div className="space-y-2">
          {guild.members.map((memberId) => (
            <div
              key={memberId}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-foreground font-medium truncate">
                {memberId === player.userId ? `${memberId} (you)` : memberId}
              </span>
              {guild.guild.founderId === memberId && (
                <span className="text-xs text-primary font-semibold bg-primary/10 rounded px-2 py-0.5">
                  Founder
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Stats
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Points</span>
            <span className="font-semibold text-foreground">
              {guild.totalPoints.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Guild Score</span>
            <span className="font-bold" style={{ color: playerColor }}>
              {guild.guildScore.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Classes Present</span>
            <span className="font-semibold text-foreground">
              {guild.classesPresent.length}/4
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onLeave}
        disabled={leaving}
        className="w-full py-2.5 text-sm text-destructive border border-destructive/30 rounded-xl hover:bg-destructive/10 transition-colors disabled:opacity-40"
      >
        {leaving ? 'Leaving...' : 'Leave Guild'}
      </button>
    </div>
  );
}
