import { useCallback, useEffect, useRef, useState } from 'react';
import { connectRealtime, disconnectRealtime } from '@devvit/web/client';
import type { AppNotification } from '../../shared/notification';

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

export function useNotifications(
  userId: string | null,
  onPush?: (notification: AppNotification) => void
) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const onPushRef = useRef(onPush);

  useEffect(() => {
    onPushRef.current = onPush;
  }, [onPush]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/notifications?userId=${encodeURIComponent(userId)}`
      );
      const data = await parseOrThrow<{ notifications: AppNotification[] }>(
        res
      );
      setNotifications(data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load ONLY
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    void refresh();
  }, [userId, refresh]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = `user_${userId}_notifications`;

    console.log(`[Realtime] Connecting to ${channel}`);

    try {
      connectRealtime({
        channel,
        onMessage: (message: unknown) => {
          console.log('[Realtime] Message received:', message);

          const notification = message as AppNotification;

          setNotifications((prev) => {
            if (prev.some((n) => n.id === notification.id)) {
              return prev;
            }

            return [notification, ...prev].slice(0, 50);
          });

          onPushRef.current?.(notification);
        },
      });

      console.log(`[Realtime] Connected to ${channel}`);
    } catch (err) {
      console.error(`[Realtime] Failed to connect to ${channel}`, err);
    }

    return () => {
      console.log(`[Realtime] Disconnecting from ${channel}`);
      disconnectRealtime(channel);
    };
  }, [userId]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
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
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
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
