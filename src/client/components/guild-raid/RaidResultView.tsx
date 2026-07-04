const RAID_WAVES = 3;

type RaidResultViewProps = Readonly<{
  victory: boolean;
  wave: number;
  totalDamage: number;
  guildHp: number;
  multiplier: number;
  playerColor: string;
  onReset: () => void;
  onBack: () => void;
}>;

export function RaidResultView({
  victory,
  wave,
  totalDamage,
  guildHp,
  multiplier,
  playerColor,
  onReset,
  onBack,
}: RaidResultViewProps) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-6 px-6 py-8 text-center">
      <div className="text-6xl animate-bounce-subtle">{victory ? '🏆' : '💀'}</div>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wider text-foreground mb-2">
          {victory ? 'Raid Complete!' : 'Guild Fallen!'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {victory
            ? `Your guild survived all ${RAID_WAVES} waves!`
            : 'Your guild HP reached zero. Train harder!'}
        </p>
      </div>

      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Waves Cleared</span>
          <span className="font-bold text-foreground">
            {victory ? RAID_WAVES : wave}/{RAID_WAVES}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Damage Dealt</span>
          <span className="font-bold" style={{ color: playerColor }}>
            {totalDamage}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Guild Survived</span>
          <span className="font-bold text-foreground">{guildHp} HP</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Guild Multiplier</span>
          <span className="font-bold" style={{ color: playerColor }}>
            ×{multiplier.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-sm gap-3">
        <button
          onClick={onReset}
          className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: playerColor }}
        >
          🏴‍☠️ Raid Again
        </button>
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Game
        </button>
      </div>
    </div>
  );
}


