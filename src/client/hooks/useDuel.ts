import { useCallback, useEffect, useState, useRef } from 'react';
import { connectRealtime, disconnectRealtime } from '@devvit/web/client';
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

function userChannel(userId: string): string {
  return `user_${userId}_notifications`;
}

const CLASSES: PlayerClass[] = ['RANGER', 'MENDER', 'WARDER', 'WEAVER'];

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

  // Track realtime connection for cleanup
  const channelRef = useRef<string | null>(null);

  // Opponents
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

  // Invites
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
      console.error('Failed to load invites:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invites');
    }
  }, [userId]);

  // Realtime connection
  useEffect(() => {
    if (!userId) {
      if (channelRef.current) {
        disconnectRealtime(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    const channel = userChannel(userId);
    channelRef.current = channel;

    console.log(`[Duel] Connecting to ${channel}`);

    try {
      connectRealtime({
        channel,
        onMessage: (message: unknown) => {
          console.log('[Duel] Realtime message', message);

          const event = message as {
            type?: string;
          };

          // Only refresh duel invites for duel-related events
          switch (event.type) {
            case 'duel_invite':
            case 'duel_accepted':
            case 'duel_declined':
            case 'duel_cancelled':
              console.log(`[Duel] Refreshing invites due to ${event.type}`);
              void refreshInvites();
              break;

            default:
              break;
          }
        },
      });

      console.log(`[Duel] Connected to ${channel}`);
    } catch (err) {
      console.error('[Duel] Failed realtime connection', err);
    }

    return () => {
      console.log(`[Duel] Disconnecting from ${channel}`);
      disconnectRealtime(channel);
      if (channelRef.current === channel) {
        channelRef.current = null;
      }
    };
  }, [userId, refreshInvites]);

  // Initial load
  useEffect(() => {
    void refreshOpponents();
  }, [refreshOpponents]);

  useEffect(() => {
    void refreshInvites();
  }, [refreshInvites]);

  // polling I don't know but I don't like it
  // useEffect(() => {
  //   if (!userId) return;

  //   const interval = setInterval(() => {
  //     void refreshInvites();
  //   }, 30000); // Every 30 seconds

  //   return () => clearInterval(interval);
  // }, [userId, refreshInvites]);

  // Actions
  const sendInvite = useCallback(
    async (toUserId: string) => {
      if (!userId) {
        console.warn('sendInvite aborted: no userId');
        return null;
      }

      console.debug('sendInvite: attempting', { fromUserId: userId, toUserId });

      try {
        const res = await fetch('/api/duel/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromUserId: userId, toUserId }),
        });

        console.debug('sendInvite: response status', res.status);

        const invite = await parseOrThrow<DuelInvite>(res);
        // Optimistic update
        setOutgoing((prev) => [...prev, invite]);
        console.info('sendInvite: success', invite.inviteId);
        return invite;
      } catch (err) {
        console.error('sendInvite: failed', err);
        setError(err instanceof Error ? err.message : String(err));
        void refreshInvites();
        throw err;
      }
    },
    [refreshInvites, userId]
  );

  const acceptInvite = useCallback(
    async (inviteId: string) => {
      if (!userId) return null;
      try {
        const res = await fetch(`/api/duel/invite/${inviteId}/accept`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const result = await parseOrThrow<{ duelId: string }>(res);
        // Optimistic update - remove from incoming
        setIncoming((prev) => prev.filter((inv) => inv.inviteId !== inviteId));
        // Real-time will trigger refresh to confirm
        return result;
      } catch (err) {
        console.error('Failed to accept invite:', err);
        // Refresh to correct state
        void refreshInvites();
        throw err;
      }
    },
    [userId, refreshInvites]
  );

  const declineInvite = useCallback(
    async (inviteId: string) => {
      if (!userId) return;
      try {
        await fetch(`/api/duel/invite/${inviteId}/decline`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        // Optimistic update
        setIncoming((prev) => prev.filter((inv) => inv.inviteId !== inviteId));
      } catch (err) {
        console.error('Failed to decline invite:', err);
        void refreshInvites();
        throw err;
      }
    },
    [userId, refreshInvites]
  );

  const cancelInvite = useCallback(
    async (inviteId: string) => {
      if (!userId) return;
      try {
        await fetch(`/api/duel/invite/${inviteId}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        // Optimistic update
        setOutgoing((prev) => prev.filter((inv) => inv.inviteId !== inviteId));
      } catch (err) {
        console.error('Failed to cancel invite:', err);
        void refreshInvites();
        throw err;
      }
    },
    [userId, refreshInvites]
  );

  return {
    opponents,
    loadingOpponents,
    refreshOpponents,
    incoming,
    outgoing,
    refreshInvites,
    error,
    sendInvite,
    acceptInvite,
    declineInvite,
    cancelInvite,
  };
}
