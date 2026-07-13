import { ChevronLeft, Sparkles } from 'lucide-react';
import { ACTION_LABELS } from '../../../shared/web';
import type { ActionType, ActionStatus } from '../../../shared/api';
import { ACTION_BASE_POINTS, ACTION_DAILY_CAPS } from '../../../shared/api';

type TrialIntroViewProps = Readonly<{
  actions: ActionType[];
  statuses: Partial<Record<ActionType, ActionStatus>>;
  color: string;
  onStart: () => void;
  onBack: () => void;
}>;

export function TrialIntroView({
  actions,
  statuses,
  color,
  onStart,
  onBack,
}: TrialIntroViewProps) {
  const anyAvailable = actions.some((a) => {
    const s = statuses[a];
    return !s || s.remaining > 0;
  });

  return (
    <div className="flex flex-col flex-1 px-4 py-4 gap-4">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground self-start"
      >
        <ChevronLeft className="size-3.5" /> Back
      </button>

      <div className="text-center flex flex-col items-center gap-2 mt-2">
        <Sparkles className="size-10" style={{ color }} />
        <h1
          className="font-display text-xl font-bold tracking-wide"
          style={{ color }}
        >
          Solo Trial
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Flip each card to complete a class action and earn points. Some
          actions are limited to a set number of uses per day.
        </p>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {actions.map((action) => {
          const status = statuses[action];
          const remaining = status?.remaining ?? ACTION_DAILY_CAPS[action];
          const cap = status?.cap ?? ACTION_DAILY_CAPS[action];
          const depleted = remaining <= 0;

          return (
            <div
              key={action}
              className="flex items-center justify-between p-3 rounded-xl border"
              style={{
                borderColor: depleted ? 'var(--color-border)' : `${color}40`,
                backgroundColor: depleted ? 'transparent' : `${color}0d`,
                opacity: depleted ? 0.5 : 1,
              }}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {ACTION_LABELS[action].label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ACTION_LABELS[action].description}
                </p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-sm font-bold" style={{ color }}>
                  +{ACTION_BASE_POINTS[action]}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {remaining}/{cap} today
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-2">
        <button
          onClick={onStart}
          disabled={!anyAvailable}
          className="w-full py-3.5 rounded-xl font-bold text-white text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:scale-105 active:enabled:scale-95"
          style={{ backgroundColor: color }}
        >
          {anyAvailable ? 'Start Trial' : 'All actions used today'}
        </button>
      </div>
    </div>
  );
}
