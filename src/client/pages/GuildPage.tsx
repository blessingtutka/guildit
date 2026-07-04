import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '../components/layout/Header';
import { Toaster } from '../components/ui/sonner';
import { GuildHubView } from '../components/guild/GuildHubView';
import { CreateGuildDrawer } from '../components/guild/CreateGuildDrawer';
import { BrowseGuildsView } from '../components/guild/BrowseGuildsView';
import { MyGuildView } from '../components/guild/MyGuildView';
import { LeaveGuildDrawer } from '../components/guild/LeaveGuildDrawer';
import { useGuild } from '../hooks/useGuild';
import { classColor } from '../lib/class-colors';
import type { Player } from '../../shared/api';

type GuildPageProps = Readonly<{
  player: Player & { level: number };
  onPlayerUpdate: (p: Player & { level: number }) => void;
  onBack: () => void;
}>;

type View = 'hub' | 'browse' | 'mine';

export function GuildPage({ player, onPlayerUpdate, onBack }: GuildPageProps) {
  const [view, setView] = useState<View>(player.guildId ? 'mine' : 'hub');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [leaveDrawerOpen, setLeaveDrawerOpen] = useState(false);

  const {
    guild,
    guilds,
    loading,
    error,
    fetchGuild,
    listGuilds,
    createGuild,
    joinGuild,
    leaveGuild,
    clearError,
  } = useGuild(player.userId);

  useEffect(() => {
    if (player.guildId) {
      void fetchGuild(player.guildId);
      setView('mine');
    }
  }, [player.guildId, fetchGuild]);

  useEffect(() => {
    if (view === 'browse') {
      void listGuilds();
    }
  }, [view, listGuilds]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const playerColor = classColor(player.class);

  const handleCreate = async (name: string) => {
    const result = await createGuild(name);
    if (result) {
      toast.success(`⚔️ Guild "${result.name}" founded!`);
      onPlayerUpdate({ ...player, guildId: result.guildId });
      setCreateDrawerOpen(false);
      setView('mine');
    }
  };

  const handleJoin = async (guildId: string) => {
    setJoiningId(guildId);
    const result = await joinGuild(guildId);
    setJoiningId(null);
    if (result) {
      toast.success(`🛡️ Joined ${result.guild.name}!`);
      onPlayerUpdate({ ...player, guildId });
      setView('mine');
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    const ok = await leaveGuild();
    setLeaving(false);
    setLeaveDrawerOpen(false);
    if (ok) {
      toast.success('You left the guild.');
      onPlayerUpdate({ ...player, guildId: null });
      setView('hub');
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex flex-col w-full min-h-full bg-background overflow-hidden">
        <Header player={player} />

        {view === 'hub' && (
          <GuildHubView
            playerColor={playerColor}
            onBack={onBack}
            onCreate={() => setCreateDrawerOpen(true)}
            onBrowse={() => setView('browse')}
          />
        )}

        {view === 'browse' && (
          <BrowseGuildsView
            guilds={guilds}
            loading={loading}
            playerColor={playerColor}
            joiningId={joiningId}
            onBack={() => setView('hub')}
            onCreate={() => setCreateDrawerOpen(true)}
            onJoin={(id) => void handleJoin(id)}
          />
        )}

        {view === 'mine' && guild && (
          <MyGuildView
            guild={guild}
            player={player}
            playerColor={playerColor}
            leaving={leaving}
            onBack={onBack}
            onLeave={() => setLeaveDrawerOpen(true)}
          />
        )}

        {view === 'mine' && !guild && loading && (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">
              Loading guild...
            </span>
          </div>
        )}
      </div>

      <CreateGuildDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        playerColor={playerColor}
        loading={loading}
        onSubmit={(name) => void handleCreate(name)}
      />

      <LeaveGuildDrawer
        open={leaveDrawerOpen}
        onClose={() => setLeaveDrawerOpen(false)}
        onConfirm={() => void handleLeave()}
        loading={leaving}
      />
    </>
  );
}
