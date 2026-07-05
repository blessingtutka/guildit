import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageShell } from '../components/common/PageShell';
import { Toaster } from '../components/ui/sonner';
import { ActionHeroBanner } from '../components/actions/ActionHeroBanner';
import { ActionCard } from '../components/actions/ActionCard';
import { PassiveEventsCard } from '../components/actions/PassiveEventsCard';
import { useAction } from '../hooks/useAction';
import { CLASS_META } from '../../shared/web';
import { classColor } from '../lib/class-colors';
import type { Player, PlayerClass, ActionType } from '../../shared/api';
import { CLASS_ACTIONS, ACTION_DAILY_CAPS } from '../../shared/api';

type ActionPageProps = Readonly<{
  player: Player & { level: number };
  onPlayerUpdate: (p: Player & { level: number }) => void;
  onBack: () => void;
}>;

export function ActionPage({
  player,
  onPlayerUpdate,
  onBack,
}: ActionPageProps) {
  const [performing, setPerforming] = useState<ActionType | null>(null);

  const { statuses, perform, fetchAllStatuses, clearError, error } = useAction(
    player.userId
  );

  const playerClass = player.class as PlayerClass;
  const meta = CLASS_META[playerClass];
  const color = classColor(playerClass);
  const actions = CLASS_ACTIONS[playerClass];

  useEffect(() => {
    void fetchAllStatuses(actions);
  }, [player.userId, fetchAllStatuses, actions]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleAction = async (action: ActionType) => {
    if (performing) return;
    const status = statuses[action];
    if (status && status.remaining <= 0) {
      toast.error('⏳ Daily limit reached — resets at midnight UTC');
      return;
    }

    setPerforming(action);
    const result = await perform(action);
    setPerforming(null);

    if (result) {
      onPlayerUpdate(result.player);
      if (result.leveledUp) {
        toast.success(`🎉 LEVEL UP! You're now Level ${result.player.level}!`);
      } else {
        toast.success(
          `+${result.pointsEarned} pts · ${result.remainingToday} uses left today`
        );
      }
    }
  };

  const totalPossibleToday = actions.reduce(
    (sum, a) => sum + ACTION_DAILY_CAPS[a],
    0
  );
  const usedToday = actions.reduce(
    (sum, a) => sum + (statuses[a]?.usedToday ?? 0),
    0
  );

  return (
    <>
      <Toaster position="top-center" richColors />
      <PageShell player={player} onBack={onBack} title="Daily Actions">
        <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
          <ActionHeroBanner
            player={player}
            usedToday={usedToday}
            totalPossible={totalPossibleToday}
            color={color}
          />

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              Daily Actions
            </p>
            {actions.map((action) => (
              <ActionCard
                key={action}
                action={action}
                color={color}
                status={statuses[action]}
                isPerforming={performing === action}
                anyPerforming={performing !== null}
                onPerform={(a) => void handleAction(a)}
              />
            ))}
          </div>

          <PassiveEventsCard meta={meta} color={color} />
        </div>
      </PageShell>
    </>
  );
}
