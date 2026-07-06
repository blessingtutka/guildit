import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DUEL_ADVANTAGE } from '../../shared/api';
import type { Player, PlayerClass, DuelInvite } from '../../shared/api';
import type { AppNotification } from '../../shared/notification';
import { useDuel, type OpponentEntry } from '../hooks/useDuel';
import { useNotifications } from '../hooks/Usenotifications';
import { SearchOpponent } from '../components/duel/SearchOppenent';
import { InvitationsPage } from '../components/duel/Invitation';
import { DuelSetupView } from '../components/duel/DuelSetupView';
import {
  InviteDetailDrawer,
  type InviteDirection,
} from '../components/duel/InviteDetailDrawer';
import { PageShell } from '../components/common/PageShell';
import { createDuelGame } from '../phaser/DuelGame';
import type { DuelLogPayload } from '../phaser/scenes/BoardScene';

interface DuelPageProps {
  player: Player & { level: number };
  onBack?: () => void;
  onExit?: () => void;
}

type View = 'search' | 'invitations' | 'preview' | 'playing';

export function DuelPage({ player, onBack, onExit }: DuelPageProps) {
  const [view, setView] = useState<View>('preview');
  const [previewOpponent, setPreviewOpponent] = useState<OpponentEntry | null>(
    null
  );
  const [duelLog, setDuelLog] = useState<DuelLogPayload | null>(null);
  const [openDuelId, setOpenDuelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detailInvite, setDetailInvite] = useState<{
    invite: DuelInvite;
    direction: InviteDirection;
  } | null>(null);

  const {
    opponents,
    loadingOpponents,
    incoming,
    outgoing,
    error,
    sendInvite,
    acceptInvite,
    declineInvite,
    cancelInvite,
  } = useDuel(player.userId);

  const { notifications, markAsRead } = useNotifications(player.userId);

  const openDuel = useCallback(async (id: string) => {
    const res = await fetch(`/api/duel/${id}`);
    const log: DuelLogPayload = await res.json();
    setOpenDuelId(id);
    setDuelLog(log);
    setDetailInvite(null);
    setView('playing');
  }, []);

  // If a URL param requests opening a duel, handle it.
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const open = params.get('open');
    if (open && open !== openDuelId) {
      void openDuel(open);
      // remove the param from the URL without reloading
      params.delete('open');
      const search = params.toString();
      const newUrl = `${location.pathname}${search ? `?${search}` : ''}`;
      globalThis.history.replaceState({}, '', newUrl);
    }
  }, [location.search, openDuel, openDuelId]);

  useEffect(() => {
    const accepted = [...incoming, ...outgoing].find(
      (i) => i.status === 'accepted' && i.duelId
    );
    if (accepted?.duelId && accepted.duelId !== openDuelId) {
      void openDuel(accepted.duelId);
    }
  }, [incoming, outgoing, openDuelId, openDuel]);

  const handleHeaderBack = useCallback(() => {
    const exit = onBack ?? onExit;
    if (view === 'invitations') {
      setView(previewOpponent ? 'preview' : 'search');
      return;
    }

    if (view === 'search') {
      setView('preview');
      return;
    }

    exit?.();
  }, [onBack, onExit, previewOpponent, view]);

  const handleSelectNotification = useCallback(
    (notification: AppNotification) => {
      void (async () => {
        try {
          await markAsRead(notification.id);
        } catch (err) {
          // ignore
        }
      })();

      const invite = notification.payload as DuelInvite | undefined;
      if (invite) {
        setDetailInvite({ invite, direction: 'incoming' });
        setView('invitations');
      }
    },
    [markAsRead]
  );

  const handleViewAllNotifications = useCallback(() => {
    setView('invitations');
  }, []);

  const handleStartDuel = async () => {
    if (!previewOpponent) return;
    setBusyId(previewOpponent.userId);
    try {
      await sendInvite(previewOpponent.userId);
      setView('invitations');
    } catch (err) {
      console.error('Failed to send invite:', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleAccept = async (inviteId: string) => {
    setBusyId(inviteId);
    try {
      const result = await acceptInvite(inviteId);
      if (result?.duelId) await openDuel(result.duelId);
    } catch (err) {
      console.error('Failed to accept invite:', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    setBusyId(inviteId);
    try {
      await declineInvite(inviteId);
      setDetailInvite(null);
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (inviteId: string) => {
    setBusyId(inviteId);
    try {
      await cancelInvite(inviteId);
      setDetailInvite(null);
    } finally {
      setBusyId(null);
    }
  };

  const pendingOutgoingByOpponent = new Map(
    outgoing.filter((i) => i.status === 'pending').map((i) => [i.toUserId, i])
  );

  const pageTitle =
    view === 'invitations'
      ? 'Invitations'
      : view === 'search'
        ? 'Find Opponent'
        : 'Duel Setup';

  if (view === 'playing' && duelLog) {
    return (
      <DuelReplay
        player={player}
        log={duelLog}
        onClose={() => (onBack ?? onExit)?.()}
        notifications={notifications}
        onSelectNotification={handleSelectNotification}
        onViewAllNotifications={handleViewAllNotifications}
      />
    );
  }

  return (
    <PageShell
      player={player}
      onBack={handleHeaderBack}
      title={pageTitle}
      notifications={notifications}
      onSelectNotification={handleSelectNotification}
      onViewAllNotifications={handleViewAllNotifications}
    >
      {view === 'invitations' ? (
        <InvitationsPage
          incoming={incoming}
          outgoing={outgoing}
          busyId={busyId}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onCancel={handleCancel}
        />
      ) : view === 'preview' ? (
        <DuelSetupView
          player={player}
          opponent={previewOpponent}
          hasAdvantage={
            !!previewOpponent &&
            DUEL_ADVANTAGE[player.class as PlayerClass] ===
              previewOpponent.class
          }
          opponentHasAdvantage={
            !!previewOpponent &&
            DUEL_ADVANTAGE[previewOpponent.class] === player.class
          }
          onStart={handleStartDuel}
          onInviteOpponent={() => setView('search')}
          onBack={handleHeaderBack}
        />
      ) : (
        <>
          <SearchOpponent
            opponents={opponents}
            loading={loadingOpponents}
            error={error}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            pendingOutgoingByOpponent={pendingOutgoingByOpponent}
            busyId={busyId}
            onSelectOpponent={(opponent) => {
              setPreviewOpponent(opponent);
              setView('preview');
            }}
            onExit={handleHeaderBack}
          />

          <InviteDetailDrawer
            invite={detailInvite?.invite ?? null}
            direction={detailInvite?.direction ?? 'incoming'}
            open={!!detailInvite}
            busy={busyId === detailInvite?.invite.inviteId}
            onClose={() => setDetailInvite(null)}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onCancel={handleCancel}
          />
        </>
      )}
    </PageShell>
  );
}

function DuelReplay({
  player,
  log,
  onClose,
  notifications,
  onSelectNotification,
  onViewAllNotifications,
}: {
  player: Player & { level: number };
  log: DuelLogPayload;
  onClose: () => void;
  notifications: AppNotification[];
  onSelectNotification: (notification: AppNotification) => void;
  onViewAllNotifications: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const game = createDuelGame(containerRef.current, log);
    return () => game.destroy(true);
  }, [log]);

  return (
    <PageShell
      player={player}
      onBack={onClose}
      title="Conversation Duel"
      notifications={notifications}
      onSelectNotification={onSelectNotification}
      onViewAllNotifications={onViewAllNotifications}
    >
      <div
        ref={containerRef}
        className="flex h-full min-h-full w-full items-center justify-center"
      />
    </PageShell>
  );
}
