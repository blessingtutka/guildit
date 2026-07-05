import { useState } from 'react';
import { Clock, Swords } from 'lucide-react';
import { InviteDetailDrawer, type InviteDirection } from './InviteDetailDrawer';
import { CLASS_META } from '../../../shared/web';
import { classColor } from '../../lib/class-colors';
import type { DuelInvite } from '../../../shared/api';

interface InvitationsPageProps {
  incoming: DuelInvite[];
  outgoing: DuelInvite[];
  busyId: string | null;
  onAccept: (inviteId: string) => void;
  onDecline: (inviteId: string) => void;
  onCancel: (inviteId: string) => void;
}

type Tab = 'incoming' | 'outgoing';

export function InvitationsPage({
  incoming,
  outgoing,
  busyId,
  onAccept,
  onDecline,
  onCancel,
}: InvitationsPageProps) {
  const [tab, setTab] = useState<Tab>('incoming');
  const [selected, setSelected] = useState<{
    invite: DuelInvite;
    direction: InviteDirection;
  } | null>(null);

  const list = tab === 'incoming' ? incoming : outgoing;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Tab bar */}
      <div className="flex gap-1 px-4 pt-3">
        <TabButton
          active={tab === 'incoming'}
          onClick={() => setTab('incoming')}
          label="Received"
          count={incoming.filter((i) => i.status === 'pending').length}
        />
        <TabButton
          active={tab === 'outgoing'}
          onClick={() => setTab('outgoing')}
          label="Sent"
          count={outgoing.filter((i) => i.status === 'pending').length}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-center">
            <Swords
              className="size-10 text-muted-foreground"
              strokeWidth={1.5}
            />
            <p className="text-sm text-muted-foreground">
              {tab === 'incoming'
                ? 'No challenges received'
                : 'No challenges sent'}
            </p>
          </div>
        ) : (
          list.map((invite) => (
            <InviteRow
              key={invite.inviteId}
              invite={invite}
              direction={tab}
              onClick={() => setSelected({ invite, direction: tab })}
            />
          ))
        )}
      </div>

      <InviteDetailDrawer
        invite={selected?.invite ?? null}
        direction={selected?.direction ?? 'incoming'}
        open={!!selected}
        busy={busyId === selected?.invite.inviteId}
        onClose={() => setSelected(null)}
        onAccept={onAccept}
        onDecline={onDecline}
        onCancel={onCancel}
      />
    </div>
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
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground'
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

function InviteRow({
  invite,
  direction,
  onClick,
}: {
  invite: DuelInvite;
  direction: InviteDirection;
  onClick: () => void;
}) {
  const cls = direction === 'incoming' ? invite.fromClass : undefined;
  const color = cls ? classColor(cls) : 'var(--color-muted-foreground)';
  const name =
    direction === 'incoming' ? invite.fromUsername : invite.toUsername;
  const meta = cls ? CLASS_META[cls] : null;

  const statusLabel: Record<DuelInvite['status'], string> = {
    pending: 'Pending',
    accepted: 'Accepted',
    declined: 'Declined',
    expired: 'Expired',
    cancelled: 'Cancelled',
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-muted-foreground/30 transition-colors text-left"
    >
      <div
        className="size-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {name[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{name}</p>
        <p className="text-xs text-muted-foreground">
          {meta ? `${meta.name} · ` : ''}
          {statusLabel[invite.status]}
        </p>
      </div>
      {invite.status === 'pending' && (
        <Clock className="size-4 text-muted-foreground shrink-0 animate-pulse" />
      )}
    </button>
  );
}
