import { useEffect } from 'react';
import { toast } from 'sonner';
import { PageShell } from '../components/common/PageShell';
import { ActionHeroBanner } from '../components/actions/ActionHeroBanner';
import { PassiveEventsCard } from '../components/actions/PassiveEventsCard';
import { useAction } from '../hooks/useAction';
import { classColor } from '../lib/class-colors';
import type { Player, PlayerClass } from '../../shared/api';
import { CLASS_ACTIONS } from '../../shared/api';

type ActionPageProps = Readonly<{
  player: Player & { level: number };
  onPlayerUpdate: (p: Player & { level: number }) => void;
  onBack: () => void;
}>;

export function ActionPage({ player, onBack }: ActionPageProps) {
  const { fetchAllStatuses, clearError, error } = useAction(player.userId);

  const playerClass = player.class as PlayerClass;
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

  return (
    <PageShell player={player} onBack={onBack} title="Daily Actions">
      <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
        <ActionHeroBanner player={player} color={color} />

        <PassiveEventsCard playerClass={playerClass} color={color} />
      </div>
    </PageShell>
  );
}
