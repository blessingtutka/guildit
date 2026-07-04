import { useCallback, useState } from 'react';
import type { PlayerClass } from '../../shared/api';

export interface ClassLeaderboardEntry {
  userId: string;
  username: string;
  score: number;
}

export interface GuildLeaderboardEntry {
  guildId: string;
  name: string;
  score: number;
}

interface LeaderboardState {
  classBoards: Partial<Record<PlayerClass, ClassLeaderboardEntry[]>>;
  guildBoard: GuildLeaderboardEntry[];
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

export function useLeaderboard() {
  const [state, setState] = useState<LeaderboardState>({
    classBoards: {},
    guildBoard: [],
    loading: false,
    error: null,
  });

  const fetchClassBoard = useCallback(
    async (playerClass: PlayerClass, limit = 10) => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));
        const res = await fetch(
          `/api/leaderboard/class/${playerClass}?limit=${limit}`
        );
        const data = await parseOrThrow<{
          class: PlayerClass;
          leaderboard: ClassLeaderboardEntry[];
        }>(res);
        setState((s) => ({
          ...s,
          loading: false,
          classBoards: { ...s.classBoards, [playerClass]: data.leaderboard },
        }));
        return data.leaderboard;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to fetch leaderboard';
        setState((s) => ({ ...s, loading: false, error: msg }));
        return [];
      }
    },
    []
  );

  const fetchGuildBoard = useCallback(async (limit = 10) => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const res = await fetch(`/api/leaderboard/guilds?limit=${limit}`);
      const data = await parseOrThrow<{
        leaderboard: GuildLeaderboardEntry[];
      }>(res);
      setState((s) => ({
        ...s,
        loading: false,
        guildBoard: data.leaderboard,
      }));
      return data.leaderboard;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to fetch guild board';
      setState((s) => ({ ...s, loading: false, error: msg }));
      return [];
    }
  }, []);

  const fetchAllBoards = useCallback(async () => {
    const classes: PlayerClass[] = ['RANGER', 'MENDER', 'WARDER', 'WEAVER'];
    await Promise.all([
      ...classes.map((c) => fetchClassBoard(c)),
      fetchGuildBoard(),
    ]);
  }, [fetchClassBoard, fetchGuildBoard]);

  return {
    classBoards: state.classBoards,
    guildBoard: state.guildBoard,
    loading: state.loading,
    error: state.error,
    fetchClassBoard,
    fetchGuildBoard,
    fetchAllBoards,
  } as const;
}
