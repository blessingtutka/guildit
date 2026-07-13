import { useCallback, useState } from 'react';
import type { ActionType, ActionStatus, Player } from '../../shared/api';
import { SYSTEM_VERIFIED_ACTIONS } from '../../shared/api';

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
}

export function useAction(userId: string | null) {
  const [statuses, setStatuses] = useState<
    Partial<Record<ActionType, ActionStatus>>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetches status for exactly the actions the caller cares about — no
  // assumption about class membership baked into the hook itself.
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

  // Returns null on failure (instead of throwing) so callers can do
  // `if (result) { ... }` without a try/catch at every call site — the
  // error is captured in state instead, for a toast/banner to show.
  const perform = useCallback(
    async (action: ActionType): Promise<PerformResult | null> => {
      if (!userId) return null;
      try {
        const res = await fetch('/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, action }),
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

  return { statuses, loading, error, clearError, perform, fetchAllStatuses };
}
