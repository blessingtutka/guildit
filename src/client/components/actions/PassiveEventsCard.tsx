import { ShieldCheck } from 'lucide-react';
import type { PlayerClass, PointEvent } from '../../../shared/api';
import {
  PASSIVE_BASE_POINTS,
  PASSIVE_EVENT_DESCRIPTIONS,
  PASSIVE_CLASS_AFFINITY,
} from '../../../shared/api';

type PassiveEventsCardProps = Readonly<{
  playerClass: PlayerClass;
  color: string;
}>;

const EVENT_LABELS: Record<PointEvent, string> = {
  POST_CREATED: 'New Post',
  COMMENT_CREATED: 'New Comment',
  REPLY_RECEIVED: 'Reply Received',
  SUPPORTIVE_REPLY: 'Supportive Comment',
  DEFENSE_REPLY: 'Defended Someone',
  WARDER_GUARD: 'Guarded Someone',
  UPVOTE_RECEIVED: '',
  DOWNVOTE_RECEIVED: '',
  AWARD_RECEIVED: '',
  CONTENT_SAVED: '',
  QUALITY_COMMENT: '',
  RANGER_DISCOVER: '',
  MENDER_COUNSEL: '',
  WEAVER_INSPIRE: '',
};

export function PassiveEventsCard({
  playerClass,
  color,
}: PassiveEventsCardProps) {
  const events: PointEvent[] = [
    'POST_CREATED',
    'COMMENT_CREATED',
    'REPLY_RECEIVED',
    'SUPPORTIVE_REPLY',
    playerClass === 'WARDER' ? 'WARDER_GUARD' : 'DEFENSE_REPLY',
  ];

  const classBonusEvents = PASSIVE_CLASS_AFFINITY[playerClass];

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <ShieldCheck className="size-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Passive Points — Automatic
        </p>
      </div>

      <div className="space-y-1.5">
        {events.map((event) => {
          const hasBonus = classBonusEvents.includes(event);
          return (
            <div
              key={event}
              className="flex items-center justify-between text-xs"
            >
              <div>
                <span className="text-foreground font-medium">
                  {EVENT_LABELS[event]}
                </span>
                <p className="text-muted-foreground text-[10px]">
                  {PASSIVE_EVENT_DESCRIPTIONS[event]}
                </p>
              </div>
              <span
                className="font-semibold shrink-0 ml-3"
                style={hasBonus ? { color } : undefined}
              >
                +{PASSIVE_BASE_POINTS[event]}
                {hasBonus ? ' ×1.5' : ''}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-3 italic">
        These happen automatically from your real Reddit activity — nothing to
        tap here.
      </p>
    </div>
  );
}
