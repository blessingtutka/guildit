import { useCallback, useState } from 'react';
import type { Guild, GuildStatus } from '../../shared/api';

interface GuildState {
  guild: GuildStatus | null;
  guilds: { guildId: string; name: string; score: number }[];
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

export function useGuild(userId: string | null) {
  const [state, setState] = useState<GuildState>({
    guild: null,
    guilds: [],
    loading: false,
    error: null,
  });

  const fetchGuild = useCallback(async (guildId: string) => {
    if (!guildId) return;
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const res = await fetch(`/api/guild/${guildId}`);
      const data = await parseOrThrow<GuildStatus>(res);
      setState((s) => ({ ...s, guild: data, loading: false }));
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load guild';
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, []);

  const listGuilds = useCallback(async () => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const res = await fetch('/api/guild?limit=20');
      const data = await parseOrThrow<{
        guilds: { guildId: string; name: string; score: number }[];
      }>(res);
      setState((s) => ({ ...s, guilds: data.guilds, loading: false }));
      return data.guilds;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to list guilds';
      setState((s) => ({ ...s, loading: false, error: msg }));
      return [];
    }
  }, []);

  const createGuild = useCallback(
    async (name: string): Promise<Guild | null> => {
      if (!userId) return null;
      try {
        setState((s) => ({ ...s, loading: true, error: null }));
        const res = await fetch('/api/guild', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, founderId: userId }),
        });
        const data = await parseOrThrow<Guild>(res);
        // fetch full status after creation
        const status = await fetch(`/api/guild/${data.guildId}`);
        const full = await parseOrThrow<GuildStatus>(status);
        setState((s) => ({ ...s, guild: full, loading: false }));
        return data;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to create guild';
        setState((s) => ({ ...s, loading: false, error: msg }));
        return null;
      }
    },
    [userId]
  );

  const joinGuild = useCallback(
    async (guildId: string): Promise<GuildStatus | null> => {
      if (!userId) return null;
      try {
        setState((s) => ({ ...s, loading: true, error: null }));
        const res = await fetch(`/api/guild/${guildId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const data = await parseOrThrow<GuildStatus>(res);
        setState((s) => ({ ...s, guild: data, loading: false }));
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to join guild';
        setState((s) => ({ ...s, loading: false, error: msg }));
        return null;
      }
    },
    [userId]
  );

  const leaveGuild = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const res = await fetch('/api/guild/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await parseOrThrow<{ left: boolean }>(res);
      setState((s) => ({ ...s, guild: null, loading: false }));
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to leave guild';
      setState((s) => ({ ...s, loading: false, error: msg }));
      return false;
    }
  }, [userId]);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return {
    guild: state.guild,
    guilds: state.guilds,
    loading: state.loading,
    error: state.error,
    fetchGuild,
    listGuilds,
    createGuild,
    joinGuild,
    leaveGuild,
    clearError,
  } as const;
}
