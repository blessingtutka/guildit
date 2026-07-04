import { ACTION_LABELS } from '../../../shared/web';
import type { ActionType } from '../../../shared/api';
import { BowArrow, PartyPopper } from 'lucide-react';

type CardState = {
  action: ActionType;
  flipped: boolean;
  points: number;
};

type TrialCompleteViewProps = Readonly<{
  cards: CardState[];
  totalEarned: number;
  leveledUp: boolean;
  newLevel: number;
  color: string;
  onBack: () => void;
}>;

export function TrialCompleteView({
  cards,
  totalEarned,
  leveledUp,
  newLevel,
  color,
  onBack,
}: TrialCompleteViewProps) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-6 px-6 py-8 text-center">
      <div className="text-6xl animate-bounce-subtle">
        {leveledUp ? (
          <PartyPopper className="size-15 text-foreground" />
        ) : (
          <BowArrow className="size-15 text-foreground" />
        )}
      </div>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wider text-foreground mb-2">
          {leveledUp ? 'Level Up!' : 'Trial Complete!'}
        </h1>
        {leveledUp && (
          <p className="text-sm font-bold mb-2" style={{ color }}>
            You reached Level {newLevel}!
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          You earned{' '}
          <span className="font-bold text-foreground">
            {totalEarned} points
          </span>{' '}
          in this trial.
        </p>
      </div>

      {/* Recap */}
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-4 space-y-2">
        {cards.map((card) => (
          <div
            key={card.action}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-foreground">
              {ACTION_LABELS[card.action].label}
            </span>
            <span className="font-bold" style={{ color }}>
              +{card.points}
            </span>
          </div>
        ))}
        <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
          <span>Total</span>
          <span style={{ color }}>{totalEarned} pts</span>
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full max-w-sm py-3 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: color }}
      >
        Back to Game
      </button>
    </div>
  );
}
