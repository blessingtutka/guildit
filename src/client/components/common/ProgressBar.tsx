interface ProgressBarProps {
  value: number; // 0–100
  color?: string; // CSS color or tailwind class color var
  className?: string;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  color,
  className = '',
  showLabel = false,
  label,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{label ?? 'Progress'}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full ${animated ? 'transition-all duration-500 ease-out' : ''}`}
          style={{
            width: `${clamped}%`,
            backgroundColor: color ?? 'var(--color-primary)',
          }}
        />
      </div>
    </div>
  );
}
