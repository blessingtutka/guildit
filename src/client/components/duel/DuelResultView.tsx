import { CLASS_META } from '../../../shared/web';
import type { PlayerClass } from '../../../shared/api';
import { ClassIcon } from '../common/ClassIcon';

type DuelResultViewProps = Readonly<{
  winner: 'player' | 'opponent' | 'tie';
  playerClass: PlayerClass;
  playerColor: string;
  opponentClass: PlayerClass;
  opponentColor: string;
  playerHp: number;
  opponentHp: number;
  onReset: () => void;
  onBack: () => void;
}>;

export function DuelResultView({
  winner,
  playerClass,
  playerColor,
  opponentClass,
  opponentColor,
  playerHp,
  opponentHp,
  onReset,
  onBack,
}: DuelResultViewProps) {
  const playerMeta = CLASS_META[playerClass];
  const opponentMeta = CLASS_META[opponentClass];

  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-6 px-6 py-8 text-center">
      <div className="text-6xl animate-bounce-subtle">
        {winner === 'player' ? '🏆' : winner === 'tie' ? '🤝' : '💀'}
      </div>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wider text-foreground mb-2">
          {winner === 'player'
            ? 'Victory!'
            : winner === 'tie'
              ? 'Draw!'
              : 'Defeated!'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {winner === 'player'
            ? `You crushed the ${opponentMeta.name}!`
            : winner === 'tie'
              ? 'A noble standoff. Evenly matched.'
              : `The ${opponentMeta.name} was stronger today.`}
        </p>
      </div>

      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span
            style={{ color: playerColor }}
            className="flex items-center gap-1"
          >
            <ClassIcon classMeta={playerMeta} className="size-3" />
            You
          </span>
          <span className="font-bold text-foreground">{playerHp} HP</span>
        </div>
        <div className="flex justify-between text-sm">
          <span
            style={{ color: opponentColor }}
            className="flex items-center gap-1"
          >
            <ClassIcon classMeta={opponentMeta} className="size-3" />
            {opponentMeta.name} Rival
          </span>
          <span className="font-bold text-foreground">{opponentHp} HP</span>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-sm gap-3">
        <button
          onClick={onReset}
          className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: playerColor }}
        >
          ⚔️ Duel Again
        </button>
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Game
        </button>
      </div>
    </div>
  );
}
