import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { TrialIntroView } from '../components/solo-trial/TrialIntroView';
import { TrialPlayView } from '../components/solo-trial/TrialPlayView';
import { TrialCompleteView } from '../components/solo-trial/TrialCompleteView';
import { useAction } from '../hooks/useAction';
import { classColor } from '../lib/class-colors';
import type { Player, PlayerClass, ActionType } from '../../shared/api';
import { CLASS_ACTIONS, ACTION_BASE_POINTS } from '../../shared/api';
import { PageShell } from '@/components/common/PageShell';

type SoloTrialPageProps = Readonly<{
  player: Player & { level: number };
  onPlayerUpdate: (p: Player & { level: number }) => void;
  onBack: () => void;
}>;

type TrialState = 'intro' | 'playing' | 'complete';

type CardState = {
  action: ActionType;
  flipped: boolean;
  points: number;
};

export function SoloTrialPage({
  player,
  onPlayerUpdate,
  onBack,
}: SoloTrialPageProps) {
  const playerClass = player.class as PlayerClass;
  const color = classColor(playerClass);
  const actions = CLASS_ACTIONS[playerClass];

  const [trialState, setTrialState] = useState<TrialState>('intro');
  const [cards, setCards] = useState<CardState[]>(
    actions.map((a) => ({
      action: a,
      flipped: false,
      points: ACTION_BASE_POINTS[a],
    }))
  );
  const [totalEarned, setTotalEarned] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [flipping, setFlipping] = useState<ActionType | null>(null);

  const { statuses, perform, fetchAllStatuses, error, clearError } = useAction(
    player.userId
  );

  useEffect(() => {
    void fetchAllStatuses(actions);
  }, [fetchAllStatuses, actions]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleFlip = useCallback(
    async (action: ActionType, cardIdx: number) => {
      const card = cards[cardIdx];
      if (!card || card.flipped || flipping) return;
      const status = statuses[action];
      if (status && status.remaining <= 0) {
        toast.error('⏳ No uses left for this action today');
        return;
      }

      setFlipping(action);
      const result = await perform(action);
      setFlipping(null);

      if (result) {
        onPlayerUpdate(result.player);
        setTotalEarned((t) => t + result.pointsEarned);
        if (result.leveledUp) setLeveledUp(true);
        setCards((prev) => {
          const next = prev.map((c, idx) =>
            idx === cardIdx ? { ...c, flipped: true as const } : c
          );
          return next;
        });
        if (cards.filter((c) => !c.flipped).length === 1) {
          setTimeout(() => setTrialState('complete'), 500);
        }
      }
    },
    [cards, flipping, statuses, perform, onPlayerUpdate]
  );

  return (
    <PageShell player={player} onBack={onBack} title="Solo Trial">
      <div className="flex min-h-full flex-col bg-background">
        {trialState === 'intro' && (
          <TrialIntroView
            actions={actions}
            statuses={statuses}
            color={color}
            onStart={() => setTrialState('playing')}
            onBack={onBack}
          />
        )}

        {trialState === 'playing' && (
          <TrialPlayView
            cards={cards}
            statuses={statuses}
            color={color}
            flipping={flipping}
            onFlip={(action, idx) => void handleFlip(action, idx)}
            onBack={onBack}
          />
        )}

        {trialState === 'complete' && (
          <TrialCompleteView
            cards={cards}
            totalEarned={totalEarned}
            leveledUp={leveledUp}
            newLevel={player.level}
            color={color}
            onBack={onBack}
          />
        )}
      </div>
    </PageShell>
  );
}
