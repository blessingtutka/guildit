import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppNotification } from '../../shared/web';
import type { DuelInvite } from '../../shared/api';
import { classColor } from '../lib/class-colors';

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

const POLL_INTERVAL_MS = 3000;

function duelInviteToNotification(invite: DuelInvite): AppNotification {
  return {
    id: invite.inviteId,
    type: 'duel_invite',
    title: `${invite.fromUsername} challenged you`,
    subtitle: invite.fromClass,
    createdAt: invite.createdAt,
    avatarInitial: invite.fromUsername[0]?.toUpperCase() ?? '?',
    avatarColor: classColor(invite.fromClass),
    payload: invite,
  };
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/duel/invite/incoming?userId=${userId}`);
      const data = await parseOrThrow<{ invites: DuelInvite[] }>(res);
      setNotifications(data.invites.map(duelInviteToNotification));
    } catch (err) {
      console.error('Failed to poll notifications:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    void refresh();
    timerRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [userId, refresh]);

  return { notifications, refresh };
}
