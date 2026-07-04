import { useState, useEffect } from 'react';
import { WelcomePage } from './pages/WelcomePage';
import { HomePage } from './pages/HomePage';
import { GuildPage } from './pages/GuildPage';
import { ActionPage } from './pages/ActionPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { SoloTrialPage } from './pages/SoloTrialPage';
import { DuelPage } from './pages/DuelPage';
import { GuildRaidPage } from './pages/GuildRaidPage';
import { usePlayer } from './hooks/usePlayer';
import { useGuild } from './hooks/useGuild';
import { useTheme } from './hooks/useTheme';
import { Toaster } from './components/ui/sonner';
import { context } from '@devvit/web/client';
import type { Player } from '../shared/api';
import type { AppPage } from './pages/HomePage';
import { TriangleAlert } from 'lucide-react';

export default function App() {
  useTheme();

  const userId = context.userId ?? 'dev-user-1';
  const username = context.username ?? 'anonymous';
  const snoovatar = context.snoovatar ?? undefined;

  const { player, loading, error, setClass, reclass } = usePlayer(
    userId,
    username,
    snoovatar
  );
  const [localPlayer, setLocalPlayer] = useState<
    (Player & { level: number }) | null
  >(null);
  const [page, setPage] = useState<AppPage>('home');

  const { guild, fetchGuild } = useGuild(userId);

  // Sync local player state with the hook's player
  useEffect(() => {
    if (player) setLocalPlayer(player);
  }, [player]);

  // Load guild when player has one
  useEffect(() => {
    const guildId = localPlayer?.guildId;
    if (guildId) {
      void fetchGuild(guildId);
    }
  }, [localPlayer?.guildId, fetchGuild]);

  const handlePlayerUpdate = (updated: Player & { level: number }) => {
    setLocalPlayer(updated);
  };

  if (loading) return <SplashScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!localPlayer) return <SplashScreen />;

  // Class selection flow
  if (!localPlayer.class) {
    return <WelcomePage player={localPlayer} onClassSelect={setClass} />;
  }

  // Page router
  if (page === 'guild') {
    return (
      <GuildPage
        player={localPlayer}
        onBack={() => setPage('home')}
        onPlayerUpdate={(updated) => {
          handlePlayerUpdate(updated);
          if (updated.guildId) void fetchGuild(updated.guildId);
        }}
      />
    );
  }

  if (page === 'actions') {
    return (
      <ActionPage
        player={localPlayer}
        onPlayerUpdate={handlePlayerUpdate}
        onBack={() => setPage('home')}
      />
    );
  }

  if (page === 'leaderboard') {
    return (
      <LeaderboardPage player={localPlayer} onBack={() => setPage('home')} />
    );
  }

  if (page === 'solo-trial') {
    return (
      <SoloTrialPage
        player={localPlayer}
        onPlayerUpdate={handlePlayerUpdate}
        onBack={() => setPage('home')}
      />
    );
  }

  if (page === 'duel') {
    return <DuelPage player={localPlayer} onBack={() => setPage('home')} />;
  }

  if (page === 'guild-raid' && guild) {
    return (
      <GuildRaidPage
        player={localPlayer}
        guild={guild}
        onPlayerUpdate={handlePlayerUpdate}
        onBack={() => setPage('home')}
      />
    );
  }

  // Home / hub
  return (
    <div className="relative w-full h-full">
      <Toaster position="top-center" richColors />
      <HomePage
        player={localPlayer}
        guild={guild}
        onNavigate={(target) => setPage(target)}
        onReclass={async (cls) => {
          await reclass(cls);
        }}
      />
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 bg-background">
      <img src="/logo.png" alt="Guildit Logo" className="h-20" />
      <span className="font-display text-xl font-bold text-primary tracking-widest">
        GUILDIT
      </span>
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  );
}

function ErrorScreen({ message }: Readonly<{ message: string }>) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 bg-background px-6 text-center">
      <TriangleAlert className="text-foreground size-6" />
      <span className="text-base font-semibold text-foreground">
        Something went wrong
      </span>
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}
