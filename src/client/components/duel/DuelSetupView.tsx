import { ClassChip } from './ClassChip';
import { CLASS_META } from '../../../shared/web';
import type { PlayerClass, Player } from '../../../shared/api';
import { DUEL_ADVANTAGE_MULTIPLIER } from '../../../shared/api';
import {
  ChevronLeft,
  TriangleAlert,
  Zap,
  Swords,
  UserPlus,
} from 'lucide-react';
import { classColor } from '@/lib/class-colors';
import { OpponentEntry } from '@/hooks/useDuel';

type DuelSetupViewProps = Readonly<{
  player: Player;
  opponent: OpponentEntry | null;
  hasAdvantage: boolean;
  opponentHasAdvantage: boolean;
  onStart: () => void;
  onInviteOpponent: () => void;
  onBack: () => void;
}>;

export function DuelSetupView({
  player,
  opponent,
  hasAdvantage,
  opponentHasAdvantage,
  onStart,
  onInviteOpponent,
  onBack,
}: DuelSetupViewProps) {
  const playerClass = player.class as PlayerClass;
  const playerColor = classColor(player.class as PlayerClass);
  const opponentClass = opponent?.class;
  const opponentColor = classColor(opponentClass);

  const playerMeta = CLASS_META[playerClass];
  const opponentMeta = opponentClass ? CLASS_META[opponentClass] : null;

  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-6 px-6 py-8 text-center">
      <Swords className="size-12 text-primary" strokeWidth={1.5} />

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

      <div className="flex items-center gap-4 w-full max-w-sm">
        <ClassChip cls={playerClass} label="You" color={playerColor} />

        <span className="font-display text-2xl font-bold text-muted-foreground">
          VS
        </span>

        <ClassChip
          cls={opponentClass}
          label={opponent?.username ?? 'To start a duel'}
          color={opponentColor}
        />
      </div>

      {opponent && opponentMeta && (hasAdvantage || opponentHasAdvantage) && (
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
          disabled={!opponent}
          className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white text-lg transition-all ${
            opponent
              ? 'hover:scale-105 hover:shadow-lg active:scale-95'
              : 'opacity-50 cursor-not-allowed'
          }`}
          style={{ backgroundColor: opponent ? playerColor : '#64748b' }}
        >
          <Swords className="size-5" />
          {opponent ? 'Start Duel' : 'Waiting for opponent...'}
        </button>
        <button
          onClick={onInviteOpponent}
          className="flex items-center justify-center gap-1.5 text-sm rounded-xl text-muted-foreground hover:text-foreground py-2.5 border border-muted-foreground
          hover:border-foreground transition-colors"
          disabled={!!opponent}
        >
          <UserPlus className="size-3.5" />
          {opponent ? 'Opponent invited' : 'Invite Opponent'}
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
