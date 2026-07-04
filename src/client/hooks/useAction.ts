import { useCallback, useState } from 'react';
import type { ActionType, Player } from '../../shared/api';

export interface ActionResult {
  player: Player & { level: number };
  pointsEarned: number;
  leveledUp: boolean;
  remainingToday: number;
}

export interface ActionStatus {
  cap: number;
  usedToday: number;
  remaining: number;
}

interface ActionState {
  statuses: Partial<Record<ActionType, ActionStatus>>;
  lastResult: ActionResult | null;
  loading: boolean;
  error: string | null;
}

interface ApiError {
  status: 'error';
  message: string;
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as ApiError).message || `HTTP ${res.status}`);
  }
  return data as T;
}

export function useAction(userId: string | null) {
  const [state, setState] = useState<ActionState>({
    statuses: {},
    lastResult: null,
    loading: false,
    error: null,
  });

  const perform = useCallback(
    async (action: ActionType): Promise<ActionResult | null> => {
      if (!userId) return null;
      try {
        setState((s) => ({ ...s, loading: true, error: null }));
        const res = await fetch('/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, action }),
        });
        const result = await parseOrThrow<ActionResult>(res);
        setState((s) => ({
          ...s,
          loading: false,
          lastResult: result,
          // update the status for this action
          statuses: {
            ...s.statuses,
            [action]: {
              ...(s.statuses[action] ?? { cap: 1, usedToday: 0 }),
              usedToday:
                (s.statuses[action]?.usedToday ?? 0) +
                1,
              remaining: result.remainingToday,
            },
          },
        }));
        return result;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to perform action';
        setState((s) => ({ ...s, loading: false, error: msg }));
        return null;
      }
    },
    [userId]
  );

  const fetchStatus = useCallback(
    async (action: ActionType): Promise<ActionStatus | null> => {
      if (!userId) return null;
      try {
        const res = await fetch(
          `/api/action/status?userId=${userId}&action=${action}`
        );
        const data = await parseOrThrow<ActionStatus>(res);
        setState((s) => ({
          ...s,
          statuses: { ...s.statuses, [action]: data },
        }));
        return data;
      } catch {
        return null;
      }
    },
    [userId]
  );

  const fetchAllStatuses = useCallback(
    async (actions: ActionType[]) => {
      if (!userId) return;
      const results = await Promise.all(
        actions.map((a) =>
          fetch(`/api/action/status?userId=${userId}&action=${a}`)
            .then((r) => r.json() as Promise<ActionStatus>)
            .then((d) => [a, d] as [ActionType, ActionStatus])
            .catch(() => null)
        )
      );
      const newStatuses: Partial<Record<ActionType, ActionStatus>> = {};
      for (const r of results) {
        if (r) newStatuses[r[0]] = r[1];
      }
      setState((s) => ({
        ...s,
        statuses: { ...s.statuses, ...newStatuses },
      }));
    },
    [userId]
  );

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const clearLastResult = useCallback(() => {
    setState((s) => ({ ...s, lastResult: null }));
  }, []);

  return {
    statuses: state.statuses,
    lastResult: state.lastResult,
    loading: state.loading,
    error: state.error,
    perform,
    fetchStatus,
    fetchAllStatuses,
    clearError,
    clearLastResult,
  } as const;
}
