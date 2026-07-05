import { ACTION_LABELS } from '../../../shared/web';
import { ACTION_BASE_POINTS } from '../../../shared/api';
import type { ActionType } from '../../../shared/api';
import type { ActionStatus } from '../../hooks/useAction';
import { ChevronLeft, Sword } from 'lucide-react';

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
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-6 px-6 py-8 text-center">
      <Sword
        className="w-24 h-24 rounded-full flex items-center justify-center text-5xl animate-bounce-subtle"
        style={{ background: `${color}20` }}
      />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wider text-foreground mb-2">
          Solo Trial
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Flip all 4 action cards to complete your trial and earn points. Each
          card uses one of your daily action slots.
        </p>
      </div>

      {/* Action preview */}
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-4 space-y-2">
        {actions.map((a) => {
          const status = statuses[a];
          const canUse = !status || status.remaining > 0;
          return (
            <div key={a} className="flex items-center justify-between text-sm">
              <span
                className={
                  canUse
                    ? 'text-foreground'
                    : 'text-muted-foreground line-through'
                }
              >
                {ACTION_LABELS[a].label}
              </span>
              <span
                className="font-bold"
                style={{ color: canUse ? color : undefined }}
              >
                +{ACTION_BASE_POINTS[a]} pts
              </span>
            </div>
          );
        })}
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-sm py-3.5 rounded-xl font-bold text-white text-lg transition-all hover:scale-105 hover:shadow-lg active:scale-95"
        style={{ backgroundColor: color }}
      >
        Begin Trial
      </button>
      <button
        onClick={onBack}
        className="w-full max-w-sm text-sm text-muted-foreground rounded-xl hover:text-foreground flex items-center justify-center gap-1 py-2.5 border border-muted-foreground
          hover:border-foreground transition-colors"
      >
        <ChevronLeft className="size-3.5" /> Back
      </button>
    </div>
  );
}
