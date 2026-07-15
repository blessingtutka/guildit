import { ChevronLeft, GamepadDirectional, Skull } from 'lucide-react';
import type { GuildStatus } from '../../../shared/api';

const RAID_WAVES = 3;

type RaidIntroViewProps = Readonly<{
  guild: GuildStatus;
  playerColor: string;
  onStart: () => void;
  onBack: () => void;
}>;

export function RaidIntroView({
  guild,
  playerColor,
  onStart,
  onBack,
}: RaidIntroViewProps) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-6 px-6 py-8 text-center">
      <Skull className="size-12 animate-bounce-subtle text-primary" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wider text-foreground mb-2">
          Guild Raid
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Your guild faces {RAID_WAVES} waves of enemies. Use your class actions
          to deal damage. Survive all waves to claim raid glory!
        </p>
      </div>

      {/* Guild status */}
      <div
        className="w-full max-w-sm rounded-2xl border p-4 space-y-2"
        style={{
          borderColor: `${playerColor}`,
          backgroundColor: `${playerColor}08`,
        }}
      >
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
          {guild.guild.name}
        </p>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Members</span>
          <span className="font-semibold">{guild.members.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Classes</span>
          <span className="font-semibold">{guild.classesPresent.length}/4</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Multiplier</span>
          <span className="font-bold" style={{ color: playerColor }}>
            ×{guild.multiplier.toFixed(1)}
          </span>
        </div>
        {guild.isComplete && (
          <span className="text-xs text-primary font-semibold flex gap-1 items-center justify-center">
            <GamepadDirectional className="size-3" />
            Full roster — maximum damage!
          </span>
        )}
      </div>

      <div className="flex flex-col w-full max-w-sm gap-3">
        <button
          onClick={onStart}
          className="w-full py-3.5 rounded-xl font-bold text-white text-lg transition-all hover:scale-105 hover:shadow-lg active:scale-95
          flex items-center justify-center text-center gap-1.5"
          style={{ backgroundColor: playerColor }}
        >
          <Skull className="size-5" /> Start Raid
        </button>
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground rounded-xl hover:text-foreground flex items-center justify-center gap-1 py-2.5 border border-muted-foreground
          hover:border-foreground transition-colors"
        >
          <ChevronLeft className="size-3.5" /> Back
        </button>
      </div>
    </div>
  );
}
