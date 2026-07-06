import { useEffect, useState } from 'react';
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
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
import type { GuildStatus, Player, PlayerClass } from '../shared/api';
import type { AppPage } from './pages/HomePage';
import { TriangleAlert } from 'lucide-react';
import { NotificationPage } from './pages/NotificationPage';

const PAGE_ROUTES: Record<AppPage, string> = {
  home: '/home',
  notifications: '/notifications',
  guild: '/guild',
  actions: '/actions',
  leaderboard: '/leaderboard',
  'solo-trial': '/solo-trial',
  duel: '/duel',
  'guild-raid': '/guild-raid',
};

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

  const { guild, fetchGuild } = useGuild(userId);

  useEffect(() => {
    if (player) {
      setLocalPlayer(player);
    }
  }, [player]);

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

  return (
    <>
      <Toaster position="top-center" richColors />
      <HashRouter>
        <AppRouter
          localPlayer={localPlayer}
          guild={guild}
          onPlayerUpdate={handlePlayerUpdate}
          onSetClass={setClass}
          onReclass={reclass}
          onFetchGuild={fetchGuild}
        />
      </HashRouter>
    </>
  );
}

type AppRouterProps = Readonly<{
  localPlayer: Player & { level: number };
  guild: GuildStatus | null;
  onPlayerUpdate: (updated: Player & { level: number }) => void;
  onSetClass: (cls: PlayerClass) => Promise<void>;
  onReclass: (cls: PlayerClass) => Promise<unknown>;
  onFetchGuild: (guildId: string) => Promise<unknown>;
}>;

function AppRouter({
  localPlayer,
  guild,
  onPlayerUpdate,
  onSetClass,
  onReclass,
  onFetchGuild,
}: AppRouterProps) {
  const navigate = useNavigate();

  const handleNavigate = (page: AppPage) => {
    void navigate(PAGE_ROUTES[page]);
  };

  const handleBackToHome = () => {
    void navigate(PAGE_ROUTES.home);
  };

  if (!localPlayer.class) {
    return (
      <Routes>
        <Route
          path="/welcome"
          element={
            <WelcomePage player={localPlayer} onClassSelect={onSetClass} />
          }
        />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={PAGE_ROUTES.home} replace />} />
      <Route
        path={PAGE_ROUTES.notifications}
        element={
          <div className="relative h-full w-full">
            <NotificationPage
              userId={localPlayer.userId}
              onBack={handleBackToHome}
            />
          </div>
        }
      />
      <Route
        path={PAGE_ROUTES.home}
        element={
          <div className="relative h-full w-full">
            <HomePage
              player={localPlayer}
              guild={guild}
              onNavigate={handleNavigate}
              onReclass={async (cls) => {
                await onReclass(cls);
              }}
            />
          </div>
        }
      />
      <Route
        path={PAGE_ROUTES.guild}
        element={
          <GuildPage
            player={localPlayer}
            onBack={handleBackToHome}
            onPlayerUpdate={(updated) => {
              onPlayerUpdate(updated);
              if (updated.guildId) void onFetchGuild(updated.guildId);
            }}
          />
        }
      />
      <Route
        path={PAGE_ROUTES.actions}
        element={
          <ActionPage
            player={localPlayer}
            onPlayerUpdate={onPlayerUpdate}
            onBack={handleBackToHome}
          />
        }
      />
      <Route
        path={PAGE_ROUTES.leaderboard}
        element={
          <LeaderboardPage player={localPlayer} onBack={handleBackToHome} />
        }
      />
      <Route
        path={PAGE_ROUTES['solo-trial']}
        element={
          <SoloTrialPage
            player={localPlayer}
            onPlayerUpdate={onPlayerUpdate}
            onBack={handleBackToHome}
          />
        }
      />
      <Route
        path={PAGE_ROUTES.duel}
        element={<DuelPage player={localPlayer} onBack={handleBackToHome} />}
      />
      <Route
        path={PAGE_ROUTES['guild-raid']}
        element={
          guild ? (
            <GuildRaidPage
              player={localPlayer}
              guild={guild}
              onPlayerUpdate={onPlayerUpdate}
              onBack={handleBackToHome}
            />
          ) : (
            <Navigate to={PAGE_ROUTES.home} replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={PAGE_ROUTES.home} replace />} />
    </Routes>
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
