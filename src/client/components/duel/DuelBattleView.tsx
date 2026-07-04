import { ProgressBar } from '../common/ProgressBar';
import { BattleCard } from './BattleCard';
import { CLASS_META } from '../../../shared/web';
import type { PlayerClass } from '../../../shared/api';
import { ClassIcon } from '../common/ClassIcon';

type CardData = {
  label: string;
  value: number;
  emoji: string;
};

type DuelBattleViewProps = Readonly<{
  playerClass: PlayerClass;
  playerColor: string;
  opponentClass: PlayerClass;
  opponentColor: string;
  playerHp: number;
  opponentHp: number;
  playerCard: CardData | null;
  opponentCard: CardData | null;
  round: number;
  phase: 'draw' | 'resolve';
  isResolving: boolean;
  username: string;
  onDraw: () => void;
}>;

export function DuelBattleView({
  playerClass,
  playerColor,
  opponentClass,
  opponentColor,
  playerHp,
  opponentHp,
  playerCard,
  opponentCard,
  round,
  phase,
  isResolving,
  username,
  onDraw,
}: DuelBattleViewProps) {
  const playerMeta = CLASS_META[playerClass];
  const opponentMeta = CLASS_META[opponentClass];

  return (
    <div className="flex flex-col flex-1 px-4 py-4 gap-4">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          Round {round}/3
        </span>
        <span className="text-xs text-muted-foreground font-semibold">
          3-Round Duel
        </span>
      </div>

      {/* HP bars */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span
              className="font-semibold flex items-center gap-1"
              style={{ color: playerColor }}
            >
              <ClassIcon classMeta={playerMeta} className="size-3" />
              {username}
            </span>
            <span className="text-muted-foreground">{playerHp} HP</span>
          </div>
          <ProgressBar value={playerHp} color={playerColor} animated />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span
              className="font-semibold flex items-center gap-1"
              style={{ color: opponentColor }}
            >
              <ClassIcon classMeta={opponentMeta} className="size-3" />
              {opponentMeta.name} Rival
            </span>
            <span className="text-muted-foreground">{opponentHp} HP</span>
          </div>
          <ProgressBar value={opponentHp} color={opponentColor} animated />
        </div>
      </div>

      {/* Card battle area */}
      <div className="flex items-center justify-center gap-4 flex-1">
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">Your Card</p>
          <BattleCard
            card={playerCard}
            color={playerColor}
            isRevealing={isResolving}
          />
        </div>

        <span className="font-display text-xl font-bold text-muted-foreground">
          VS
        </span>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">Rival's Card</p>
          <BattleCard
            card={phase === 'resolve' ? opponentCard : null}
            color={opponentColor}
            isRevealing={isResolving}
          />
        </div>
      </div>

      {phase === 'draw' && (
        <button
          onClick={onDraw}
          className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: playerColor }}
        >
          🃏 Draw Card
        </button>
      )}
      {phase === 'resolve' && isResolving && (
        <div className="text-center text-sm text-muted-foreground animate-pulse">
          Resolving...
        </div>
      )}
    </div>
  );
}
