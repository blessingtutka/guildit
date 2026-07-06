import { useState } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

import type { AppNotification } from '../../shared/notification';
import { useNotifications } from '@/hooks/Usenotifications';
import { PageShell } from '@/components/common/PageShell';
import { NotificationRow } from '@/components/notification/NotificationRow';
import { NotificationDetailDrawer } from '@/components/notification/NotificationDetailDrawer';

interface NotificationPageProps {
  userId: string;
  onBack: () => void;
}

export function NotificationPage({ userId, onBack }: NotificationPageProps) {
  const { notifications, loading, markAsRead, deleteNotification, clearAll } =
    useNotifications(userId);

  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [selected, setSelected] = useState<AppNotification | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications
    .filter((n) => filterTab === 'all' || !n.read)
    .sort((a, b) => b.createdAt - a.createdAt);

  const handleNotificationClick = async (notification: AppNotification) => {
    setBusyId(notification.id);

    if (!notification.read) {
      await markAsRead(notification.id);
    }

    setSelected(notification);
    setIsDrawerOpen(true);
    setBusyId(null);
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    await deleteNotification(id);
    if (selected?.id === id) {
      setIsDrawerOpen(false);
      setSelected(null);
    }
    setBusyId(null);
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    for (const id of unreadIds) {
      await markAsRead(id);
    }
  };

  const handleClearAll = async () => {
    await clearAll();
    setIsDrawerOpen(false);
    setSelected(null);
  };

  if (loading && notifications.length === 0) {
    return (
      <PageShell title="Notifications" onBack={onBack}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Notifications" onBack={onBack}>
      <div className="flex flex-col h-full bg-background">
        {/* Header with actions */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <div className="flex gap-1">
            <TabButton
              active={filterTab === 'all'}
              onClick={() => setFilterTab('all')}
              label="All"
              count={notifications.length}
            />
            <TabButton
              active={filterTab === 'unread'}
              onClick={() => setFilterTab('unread')}
              label="Unread"
              count={unreadCount}
            />
          </div>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="size-4 text-muted-foreground" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Clear all notifications"
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                busy={busyId === notification.id}
              />
            ))
          )}
        </div>

        {/* Detail Drawer */}
        <NotificationDetailDrawer
          notification={selected}
          open={isDrawerOpen}
          busy={busyId === selected?.id}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelected(null);
          }}
          onDelete={handleDelete}
          userId={userId}
        />
      </div>
    </PageShell>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`text-xs rounded-full px-1.5 leading-5 ${
            active ? 'bg-primary-foreground/20' : 'bg-muted'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
      <div className="size-16 rounded-full bg-muted flex items-center justify-center">
        <Bell className="size-8 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-semibold text-foreground">No notifications yet</p>
        <p className="text-sm text-muted-foreground max-w-xs mt-1">
          You'll receive duel invitations, guild invites and battle results
          here.
        </p>
      </div>
    </div>
  );
}
