import { ACTION_LABELS } from '../../../shared/web';
import type { ActionType } from '../../../shared/api';
import { ACTION_BASE_POINTS, ACTION_DAILY_CAPS } from '../../../shared/api';
import type { ActionStatus } from '../../hooks/useAction';

type ActionCardProps = Readonly<{
  action: ActionType;
  color: string;
  status: ActionStatus | undefined;
  isPerforming: boolean;
  anyPerforming: boolean;
  onPerform: (action: ActionType) => void;
}>;

export function ActionCard({
  action,
  color,
  status,
  isPerforming,
  anyPerforming,
  onPerform,
}: ActionCardProps) {
  const label = ACTION_LABELS[action];
  const cap = ACTION_DAILY_CAPS[action];
  const used = status?.usedToday ?? 0;
  const remaining = status?.remaining ?? cap;
  const exhausted = remaining <= 0;

  return (
    <button
      type="button"
      onClick={() => onPerform(action)}
      disabled={exhausted || anyPerforming}
      className={`w-full flex items-center justify-between bg-card border rounded-xl px-4 py-3.5 transition-all duration-200 text-left ${
        exhausted
          ? 'opacity-40 cursor-not-allowed border-border'
          : 'hover:scale-[1.02] hover:shadow-md active:scale-[0.99] cursor-pointer'
      }`}
      style={exhausted ? {} : { borderColor: `${color}` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-sm font-bold"
            style={exhausted ? {} : { color }}
          >
            {label.label}
          </span>
          {isPerforming && (
            <span className="text-xs text-muted-foreground animate-pulse">
              ...
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{label.description}</p>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
        <span className="text-sm font-bold" style={exhausted ? {} : { color }}>
          +{ACTION_BASE_POINTS[action]}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: cap }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full border transition-all duration-300"
              style={{
                borderColor: color,
                backgroundColor: i < used ? color : 'transparent',
                opacity: i < used ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </button>
  );
}
