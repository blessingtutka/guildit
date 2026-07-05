import { useCallback, useEffect, useRef, useState } from 'react';
import type { DuelInvite, PlayerClass } from '../../shared/api';

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

const CLASSES: PlayerClass[] = ['RANGER', 'MENDER', 'WARDER', 'WEAVER'];
const INVITE_POLL_INTERVAL_MS = 3000;

export interface OpponentEntry {
  userId: string;
  username: string;
  class: PlayerClass;
}

export function useDuel(userId: string | null, perClassLimit = 5) {
  const [opponents, setOpponents] = useState<OpponentEntry[]>([]);
  const [loadingOpponents, setLoadingOpponents] = useState(true);

  const [incoming, setIncoming] = useState<DuelInvite[]>([]);
  const [outgoing, setOutgoing] = useState<DuelInvite[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inviteTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshOpponents = useCallback(async () => {
    if (!userId) return;
    try {
      setLoadingOpponents(true);
      const results = await Promise.all(
        CLASSES.map((cls) =>
          fetch(`/api/leaderboard/class/${cls}?limit=${perClassLimit}`).then(
            (res) =>
              parseOrThrow<{
                class: PlayerClass;
                leaderboard: {
                  userId: string;
                  username: string;
                  score: number;
                }[];
              }>(res)
          )
        )
      );

      const merged: OpponentEntry[] = results.flatMap((r) =>
        r.leaderboard
          .filter((entry) => entry.userId !== userId)
          .map((entry) => ({
            userId: entry.userId,
            username: entry.username,
            class: r.class,
          }))
      );

      setOpponents(merged);
      setError(null);
    } catch (err) {
      console.error('Failed to load opponents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load opponents');
    } finally {
      setLoadingOpponents(false);
    }
  }, [userId, perClassLimit]);

  useEffect(() => {
    void refreshOpponents();
    // Intentionally NOT on the invite poll timer — see file header comment.
  }, [refreshOpponents]);

  // ── Invites — polled on their own fast interval, opponents untouched ───────
  const refreshInvites = useCallback(async () => {
    if (!userId) return;
    try {
      const [incRes, outRes] = await Promise.all([
        fetch(`/api/duel/invite/incoming?userId=${userId}`),
        fetch(`/api/duel/invite/outgoing?userId=${userId}`),
      ]);
      const inc = await parseOrThrow<{ invites: DuelInvite[] }>(incRes);
      const out = await parseOrThrow<{ invites: DuelInvite[] }>(outRes);
      setIncoming(inc.invites);
      setOutgoing(out.invites);
      setError(null);
    } catch (err) {
      console.error('Failed to poll invites:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invites');
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    void refreshInvites();
    inviteTimerRef.current = setInterval(
      refreshInvites,
      INVITE_POLL_INTERVAL_MS
    );
    return () => {
      if (inviteTimerRef.current) clearInterval(inviteTimerRef.current);
    };
  }, [userId, refreshInvites]);

  const sendInvite = useCallback(
    async (toUserId: string) => {
      if (!userId) return;
      const res = await fetch('/api/duel/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: userId, toUserId }),
      });
      const invite = await parseOrThrow<DuelInvite>(res);
      setOutgoing((prev) => [...prev, invite]);
      return invite;
    },
    [userId]
  );

  const acceptInvite = useCallback(
    async (inviteId: string) => {
      if (!userId) return null;
      const res = await fetch(`/api/duel/invite/${inviteId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const result = await parseOrThrow<{ duelId: string }>(res);
      await refreshInvites();
      return result;
    },
    [userId, refreshInvites]
  );

  const declineInvite = useCallback(
    async (inviteId: string) => {
      if (!userId) return;
      await fetch(`/api/duel/invite/${inviteId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await refreshInvites();
    },
    [userId, refreshInvites]
  );

  const cancelInvite = useCallback(
    async (inviteId: string) => {
      if (!userId) return;
      await fetch(`/api/duel/invite/${inviteId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await refreshInvites();
    },
    [userId, refreshInvites]
  );

  return {
    opponents,
    loadingOpponents,
    refreshOpponents,
    incoming,
    outgoing,
    error,
    sendInvite,
    acceptInvite,
    declineInvite,
    cancelInvite,
  };
}
