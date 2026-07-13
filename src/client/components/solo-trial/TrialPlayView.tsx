import { ProgressBar } from '../common/ProgressBar';
import { ACTION_LABELS } from '../../../shared/web';
import { isSystemVerified } from '../../hooks/useAction';
import type { ActionType, ActionStatus } from '../../../shared/api';
import { Check, ChevronLeft, Sparkles, ShieldCheck } from 'lucide-react';

type CardState = {
  action: ActionType;
  flipped: boolean;
  points: number;
};

type TrialPlayViewProps = Readonly<{
  cards: CardState[];
  statuses: Partial<Record<ActionType, ActionStatus>>;
  color: string;
  flipping: ActionType | null;
  onFlip: (action: ActionType, idx: number) => void;
  onBack: () => void;
}>;

export function TrialPlayView({
  cards,
  statuses,
  color,
  flipping,
  onFlip,
  onBack,
}: TrialPlayViewProps) {
  const flippedCount = cards.filter((c) => c.flipped).length;
  const progress = (flippedCount / cards.length) * 100;

  return (
    <div className="flex flex-col flex-1 px-4 py-4 gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" /> Back
        </button>
        <div className="flex-1">
          <ProgressBar value={progress} color={color} animated />
        </div>
        <span className="text-xs text-muted-foreground">
          {flippedCount}/{cards.length}
        </span>
      </div>

      <div className="text-center">
        <h2
          className="font-display text-lg font-bold tracking-wide"
          style={{ color }}
        >
          Flip Your Action Cards
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Tap each card to complete the action
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-4 flex-1 content-center">
        {cards.map((card, i) => {
          const status = statuses[card.action];
          const available = !status || status.remaining > 0;
          const isFlipping = flipping === card.action;
          const isAuto = isSystemVerified(card.action);

          return (
            <div
              key={card.action}
              className="relative aspect-3/4"
              style={{ perspective: '1000px' }}
            >
              <div
                className="w-full h-full transition-all duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: card.flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front (unflipped) */}
                <button
                  type="button"
                  onClick={() => !isAuto && onFlip(card.action, i)}
                  disabled={
                    card.flipped || !!flipping || (isAuto && !available)
                  }
                  className={`absolute inset-0 w-full h-full rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                    card.flipped
                      ? 'pointer-events-none'
                      : isAuto
                        ? 'cursor-default'
                        : available
                          ? 'cursor-pointer hover:scale-105 hover:shadow-lg active:scale-95'
                          : 'cursor-not-allowed opacity-40'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    backgroundColor: `${color}15`,
                    borderColor: isAuto ? `${color}80` : color,
                    borderStyle: isAuto ? 'dashed' : 'solid',
                  }}
                >
                  {isFlipping ? (
                    <Sparkles className="size-7.5 text-foreground animate-spin" />
                  ) : (
                    <>
                      {isAuto ? (
                        <ShieldCheck className="size-8" style={{ color }} />
                      ) : (
                        <img
                          src="/logo.png"
                          alt="Guildit Logo"
                          className="h-20"
                        />
                      )}
                      <span className="text-xs font-semibold text-muted-foreground">
                        {ACTION_LABELS[card.action].label}
                      </span>
                      {isAuto && (
                        <span className="text-[10px] text-muted-foreground text-center px-2 leading-tight">
                          Earned automatically — post real content to unlock
                        </span>
                      )}
                    </>
                  )}
                </button>

                {/* Back (flipped) */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl border-2 flex flex-col items-center justify-center gap-2"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    backgroundColor: `${color}25`,
                    borderColor: color,
                  }}
                >
                  <Check className="size-7.5 text-foreground animate-pulse" />
                  <span className="text-sm font-bold" style={{ color }}>
                    {ACTION_LABELS[card.action].label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    +{card.points} pts
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
