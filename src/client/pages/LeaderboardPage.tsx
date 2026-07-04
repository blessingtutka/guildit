import { useEffect } from 'react';
import { PageShell } from '../components/common/PageShell';
import { LeaderboardTabs } from '../components/leaderboard/LeaderboardTabs';
import { useLeaderboard } from '../hooks/useLeaderboard';
import type { Player } from '../../shared/api';

type LeaderboardPageProps = Readonly<{
  player: Player & { level: number };
  onBack: () => void;
}>;

export function LeaderboardPage({ player, onBack }: LeaderboardPageProps) {
  const { classBoards, guildBoard, loading, fetchAllBoards } = useLeaderboard();

  useEffect(() => {
    void fetchAllBoards();
  }, [fetchAllBoards]);

  return (
    <PageShell player={player} onBack={onBack} title="Leaderboard">
      <LeaderboardTabs
        player={player}
        classBoards={classBoards}
        guildBoard={guildBoard}
        loading={loading}
      />
    </PageShell>
  );
}
