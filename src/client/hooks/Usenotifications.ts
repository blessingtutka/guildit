import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppNotification } from '../../shared/notification';
import { useDevvit } from './useDevvit';

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

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const mounted = useRef(false);

  const refresh = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const res = await fetch(
        `/api/notifications?userId=${encodeURIComponent(userId)}`
      );

      const data = await parseOrThrow<{
        notifications: AppNotification[];
      }>(res);

      setNotifications(data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Listen for Devvit messages (realtime pushes). We accept multiple shapes so
  // the hook is resilient to how the runtime delivers push payloads.
  useDevvit((msg: any) => {
    if (!userId) return;

    try {
      // Case 1: explicit notification wrapper
      if (msg && msg.type === 'NOTIFICATION' && msg.notification) {
        const n = msg.notification as AppNotification;
        setNotifications((prev) => [n, ...prev].slice(0, 50));
        return;
      }

      // Case 2: realtime event wrapper with channel & payload
      if (
        msg &&
        (msg.type === 'REALTIME_EVENT' || msg.type === 'RECONNECT') &&
        typeof msg.channel === 'string' &&
        msg.channel.includes(`user:${userId}:notifications`)
      ) {
        const payload = msg.payload ?? msg.data ?? msg.event ?? null;
        if (typeof payload === 'string') {
          try {
            const n = JSON.parse(payload) as AppNotification;
            if (n && n.id)
              setNotifications((prev) => [n, ...prev].slice(0, 50));
          } catch (err) {
            // ignore
          }
        } else if (payload && typeof payload === 'object' && 'id' in payload) {
          const n = payload as AppNotification;
          setNotifications((prev) => [n, ...prev].slice(0, 50));
        }
        return;
      }

      // Case 3: some runtimes post a raw notification object
      if (msg && typeof msg === 'object' && 'id' in msg && 'type' in msg) {
        const n = msg as AppNotification;
        setNotifications((prev) => [n, ...prev].slice(0, 50));
        return;
      }
    } catch (err) {
      console.warn('Failed to handle realtime notification message', err);
    }
  });

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    // Initial load (keep this to bootstrap state). Subsequent updates come
    // from realtime pushes handled above.
    void refresh();

    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, [userId, refresh]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    },
    [userId]
  );

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      await fetch(
        `/api/notifications/${notificationId}?userId=${encodeURIComponent(userId)}`,
        {
          method: 'DELETE',
        }
      );

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    },
    [userId]
  );

  const clearAll = useCallback(async () => {
    if (!userId) return;

    await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });

    setNotifications([]);
  }, [userId]);

  return {
    notifications,
    loading,
    refresh,
    markAsRead,
    deleteNotification,
    clearAll,
  };
}
