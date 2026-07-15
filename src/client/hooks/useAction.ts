import { useCallback, useState } from 'react';
import type {
  ActionType,
  ActionStatus,
  Player,
  PlayerClass,
  ClientChallenge,
} from '../../shared/api';
import { ACTION_DAILY_CAPS, SYSTEM_VERIFIED_ACTIONS } from '../../shared/api';
import { toast } from 'sonner';

interface ApiError {
  status: 'error';
  message: string;
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok)
    throw new Error((data as ApiError).message || `HTTP ${res.status}`);
  return data as T;
}

export function isSystemVerified(action: ActionType): boolean {
  return SYSTEM_VERIFIED_ACTIONS.includes(action);
}

export interface PerformResult {
  player: Player & { level: number };
  action: ActionType;
  pointsEarned: number;
  leveledUp: boolean;
  remainingToday: number;
  challengeResult?: { correct: boolean; explanation?: string };
}

export function useAction(userId: string | null) {
  const ACTIONS_ENABLED = false;

  const [statuses, setStatuses] = useState<
    Partial<Record<ActionType, ActionStatus>>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllStatuses = useCallback(
    async (actions: ActionType[]) => {
      if (!userId || actions.length === 0) return;
      try {
        setLoading(true);
        const results = await Promise.all(
          actions.map((action) =>
            fetch(
              `/api/action/status?userId=${encodeURIComponent(userId)}&action=${action}`
            )
              .then((res) => parseOrThrow<ActionStatus>(res))
              .then((status) => [action, status] as const)
          )
        );
        setStatuses(Object.fromEntries(results));
      } catch (err) {
        console.error('Failed to load action statuses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load actions');
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const fetchChallenge = useCallback(
    async (playerClass: PlayerClass): Promise<ClientChallenge | null> => {
      try {
        const res = await fetch(
          `/api/action/challenge?playerClass=${playerClass}`
        );
        return await parseOrThrow<ClientChallenge>(res);
      } catch (err) {
        console.error('Failed to load challenge:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load challenge'
        );
        return null;
      }
    },
    []
  );

  const performGuildRaidAttack = useCallback(
    async (
      action: ActionType,
      player: Player & { level: number }
    ): Promise<PerformResult | null> => {
      if (!userId) return null;

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 400));

      const pointsEarned = Math.floor(Math.random() * 20) + 10;
      const cap = ACTION_DAILY_CAPS[action] ?? 5;
      const used = (statuses[action]?.usedToday ?? 0) + 1;
      const remaining = Math.max(0, cap - used);

      setStatuses((prev) => ({
        ...prev,
        [action]: { cap, usedToday: used, remaining },
      }));

      // Update the player's points (and maybe level if you want to simulate)
      const updatedPlayer: Player & { level: number } = {
        ...player,
        points: player.points + pointsEarned,
      };

      return {
        player: updatedPlayer,
        action,
        pointsEarned,
        leveledUp: false,
        remainingToday: remaining,
        challengeResult: { correct: true, explanation: 'Guild raid attack' },
      };
    },
    [userId, statuses]
  );

  const perform = useCallback(
    async (
      action: ActionType,
      challengeId: string,
      chosenOptionId: string
    ): Promise<PerformResult | null> => {
      if (!userId) return null;
      if (!ACTIONS_ENABLED) {
        toast.info('⛔ Actions are disabled (under construction)');
        return null;
      }
      try {
        const res = await fetch('/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, action, challengeId, chosenOptionId }),
        });
        const result = await parseOrThrow<PerformResult>(res);

        setStatuses((prev) => {
          const existing = prev[action];
          const cap = existing?.cap ?? result.remainingToday + 1;
          return {
            ...prev,
            [action]: {
              cap,
              usedToday: cap - result.remainingToday,
              remaining: result.remainingToday,
            },
          };
        });

        return result;
      } catch (err) {
        console.error('Failed to perform action:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to perform action'
        );
        return null;
      }
    },
    [userId]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    statuses,
    loading,
    error,
    clearError,
    perform,
    fetchAllStatuses,
    fetchChallenge,
    performGuildRaidAttack,
  };
}
