import { ClassChip } from './ClassChip';
import { CLASS_META } from '../../../shared/web';
import type { PlayerClass } from '../../../shared/api';
import { DUEL_ADVANTAGE_MULTIPLIER } from '../../../shared/api';
import { ChevronLeft, TriangleAlert, Zap } from 'lucide-react';

type DuelSetupViewProps = Readonly<{
  playerClass: PlayerClass;
  playerColor: string;
  opponentClass: PlayerClass;
  opponentColor: string;
  hasAdvantage: boolean;
  opponentHasAdvantage: boolean;
  onStart: () => void;
  onNewOpponent: () => void;
  onBack: () => void;
}>;

export function DuelSetupView({
  playerClass,
  playerColor,
  opponentClass,
  opponentColor,
  hasAdvantage,
  opponentHasAdvantage,
  onStart,
  onNewOpponent,
  onBack,
}: DuelSetupViewProps) {
  const playerMeta = CLASS_META[playerClass];
  const opponentMeta = CLASS_META[opponentClass];

  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-6 px-6 py-8 text-center">
      <div className="text-5xl animate-bounce-subtle">⚔️</div>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wider text-foreground mb-2">
          Class Duel
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          3 rounds of card combat. Each class has unique cards. Class advantages
          deal{' '}
          <span className="text-primary font-semibold">
            ×{DUEL_ADVANTAGE_MULTIPLIER} damage
          </span>
          .
        </p>
      </div>

      {/* Matchup preview */}
      <div className="flex items-center gap-4 w-full max-w-sm">
        <ClassChip cls={playerClass} label="You" color={playerColor} />
        <span className="font-display text-2xl font-bold text-muted-foreground">
          VS
        </span>
        <ClassChip cls={opponentClass} label="Rival" color={opponentColor} />
      </div>

      {/* Advantage indicator */}
      {(hasAdvantage || opponentHasAdvantage) && (
        <div
          className="text-xs px-3 py-1.5 rounded-full border font-semibold flex items-center gap-1.5"
          style={
            hasAdvantage
              ? {
                  color: playerColor,
                  borderColor: playerColor,
                  backgroundColor: `${playerColor}15`,
                }
              : {
                  color: opponentColor,
                  borderColor: opponentColor,
                  backgroundColor: `${opponentColor}15`,
                }
          }
        >
          {hasAdvantage ? (
            <Zap className="size-3" />
          ) : (
            <TriangleAlert className="size-3" />
          )}
          {hasAdvantage
            ? `${playerMeta.name} has advantage over ${opponentMeta.name}`
            : `${opponentMeta.name} has advantage over ${playerMeta.name}`}
        </div>
      )}

      <div className="flex flex-col w-full max-w-sm gap-3">
        <button
          onClick={onStart}
          className="w-full py-3.5 rounded-xl font-bold text-white text-lg transition-all hover:scale-105 hover:shadow-lg active:scale-95"
          style={{ backgroundColor: playerColor }}
        >
          ⚔️ Start Duel
        </button>
        <button
          onClick={onNewOpponent}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          🎲 Invite Opponent
        </button>
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
        >
          <ChevronLeft className="size-3.5" /> Back
        </button>
      </div>
    </div>
  );
}
