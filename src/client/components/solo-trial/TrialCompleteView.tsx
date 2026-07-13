import { Trophy, Sparkles, ChevronLeft } from 'lucide-react';
import { ACTION_LABELS } from '../../../shared/web';
import type { ActionType } from '../../../shared/api';

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
  const completed = cards.filter((c) => c.flipped);

  return (
    <div className="flex flex-col flex-1 px-4 py-4 gap-4">
      <div className="text-center flex flex-col items-center gap-2 mt-4">
        <Trophy className="size-12" style={{ color }} />
        <h1
          className="font-display text-xl font-bold tracking-wide"
          style={{ color }}
        >
          Trial Complete
        </h1>
        <p className="text-3xl font-black" style={{ color }}>
          +{totalEarned}
        </p>
        <p className="text-xs text-muted-foreground">points earned</p>
      </div>

      {leveledUp && (
        <div
          className="flex items-center justify-center gap-2 p-3 rounded-xl border"
          style={{ borderColor: color, backgroundColor: `${color}15` }}
        >
          <Sparkles className="size-4" style={{ color }} />
          <span className="text-sm font-bold" style={{ color }}>
            Level Up! You're now level {newLevel}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-2">
        {completed.map((card) => (
          <div
            key={card.action}
            className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
          >
            <span className="text-sm font-medium text-foreground">
              {ACTION_LABELS[card.action].label}
            </span>
            <span className="text-sm font-bold" style={{ color }}>
              +{card.points}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-2">
        <button
          onClick={onBack}
          className="w-full py-3.5 rounded-xl font-bold text-white text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          style={{ backgroundColor: color }}
        >
          <ChevronLeft className="size-4" />
          Done
        </button>
      </div>
    </div>
  );
}
