import type { ClassMeta } from '../../../shared/web';

type PassiveEventsCardProps = Readonly<{
  meta: ClassMeta;
  color: string;
}>;

export function PassiveEventsCard({ meta, color }: PassiveEventsCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        Passive Events (Auto)
      </p>
      <div className="space-y-1.5">
        {meta.affinity.map((event) => (
          <div key={event} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{event.replace(/_/g, ' ')}</span>
            <span className="font-semibold" style={{ color }}>
              ×1.5 bonus
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3 italic">
        These trigger automatically from your Reddit activity.
      </p>
    </div>
  );
}
