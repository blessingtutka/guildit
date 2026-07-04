import { useCallback, useEffect, useState } from 'react';
import type { Player, PlayerClass, ReclassPreview } from '../../shared/api';

interface PlayerState {
  player: (Player & { level: number }) | null;
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

export function usePlayer(userId: string | null, username?: string, snoovatar?: string) {
  const [state, setState] = useState<PlayerState>({
    player: null,
    loading: true,
    error: null,
  });

  // INIT
  useEffect(() => {
    if (!userId) return;

    void (async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));

        const res = await fetch('/api/player', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, username: username ?? 'anonymous', snoovatar: snoovatar ?? null }),
        });

        const data = await parseOrThrow<Player & { level: number }>(res);
        setState({ player: data, loading: false, error: null });
      } catch (err) {
        console.error('Failed to load player:', err);
        setState({
          player: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    })().catch((err) => {
      // already handled inside, but satisfy lint for unhandled promise
      console.error('Unhandled async init error:', err);
    });
  }, [userId, username]);

  // SET CLASS
  const setClass = useCallback(
    async (playerClass: PlayerClass) => {
      if (!userId) return;
      try {
        const res = await fetch('/api/player/class', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, playerClass }),
        });
        const updated = await parseOrThrow<Player & { level: number }>(res);
        setState((prev) => ({ ...prev, player: updated, error: null }));
      } catch (err) {
        console.error('Failed to set class:', err);
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to set class',
        }));
      }
    },
    [userId]
  );

  // ADD POINTS
  const addPoints = useCallback(
    async (pointsToAdd: number) => {
      if (!userId) return;
      try {
        const res = await fetch('/api/player/points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, pointsToAdd }),
        });
        const result = await parseOrThrow<{
          player: Player & { level: number };
          leveledUp: boolean;
          pointsAdded: number;
        }>(res);
        setState((prev) => ({ ...prev, player: result.player, error: null }));
        return result; // caller can check leveledUp for animation trigger
      } catch (err) {
        console.error('Failed to add points:', err);
      }
    },
    [userId]
  );

  // RECLASS PREVIEW (read-only, no state mutation)
  const getReclassPreview =
    useCallback(async (): Promise<ReclassPreview | null> => {
      if (!userId) return null;
      try {
        const res = await fetch(`/api/player/reclass/preview?userId=${userId}`);
        return await parseOrThrow<ReclassPreview>(res);
      } catch (err) {
        console.error('Failed to get reclass preview:', err);
        return null;
      }
    }, [userId]);

  //  RECLASS (writes)
  const reclass = useCallback(
    async (newClass: PlayerClass) => {
      if (!userId) return;
      try {
        const res = await fetch('/api/player/reclass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, newClass }),
        });
        const result = await parseOrThrow<{
          player: Player & { level: number };
          cost: number;
          taxRate: number;
        }>(res);
        setState((prev) => ({ ...prev, player: result.player, error: null }));
        return result;
      } catch (err) {
        console.error('Failed to reclass:', err);
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to reclass',
        }));
      }
    },
    [userId]
  );

  return {
    player: state.player,
    loading: state.loading,
    error: state.error,
    setClass,
    addPoints,
    getReclassPreview,
    reclass,
  } as const;
}
