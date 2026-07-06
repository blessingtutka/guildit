import { useState } from 'react';
import { toast } from 'sonner';
import { PageShell } from '../components/common/PageShell';
import { ClassPickerDrawer } from '../components/common/ClassPickerDrawer';
import { PlayerHeroCard } from '../components/home/PlayerHeroCard';
import { GuildStatusCard } from '../components/home/GuildStatusCard';
import { NavGrid } from '../components/home/NavGrid';
import { MiniGamesSection } from '../components/home/MiniGamesSection';
import { classColor } from '../lib/class-colors';
import type {
  Player,
  PlayerClass,
  GuildStatus,
  ReclassPreview,
} from '../../shared/api';

export type AppPage =
  | 'home'
  | 'notifications'
  | 'guild'
  | 'actions'
  | 'leaderboard'
  | 'solo-trial'
  | 'duel'
  | 'guild-raid';

type HomePageProps = Readonly<{
  player: Player & { level: number };
  guild: GuildStatus | null;
  onNavigate: (page: AppPage) => void;
  onReclass: (cls: PlayerClass) => Promise<void>;
}>;

export function HomePage({
  player,
  guild,
  onNavigate,
  onReclass,
}: HomePageProps) {
  const [changeClassOpen, setChangeClassOpen] = useState(false);
  const [reclassPreview, setReclassPreview] = useState<ReclassPreview | null>(
    null
  );

  const color = classColor(player.class);

  const openChangeClass = async () => {
    try {
      const res = await fetch(
        `/api/player/reclass/preview?userId=${player.userId}`
      );
      const data = (await res.json()) as ReclassPreview;
      setReclassPreview(data);
    } catch {
      setReclassPreview(null);
    }
    setChangeClassOpen(true);
  };

  const handleReclass = async (cls: PlayerClass) => {
    await onReclass(cls);
    toast.success(`Class changed to ${cls}!`);
  };

  return (
    <PageShell player={player}>
      <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
        <PlayerHeroCard
          player={player}
          onChangeClass={() => void openChangeClass()}
        />
        <GuildStatusCard
          guild={guild}
          color={color}
          onNavigate={() => onNavigate('guild')}
        />
        <NavGrid color={color} onNavigate={onNavigate} />
        <MiniGamesSection color={color} guild={guild} onNavigate={onNavigate} />
      </div>

      <ClassPickerDrawer
        open={changeClassOpen}
        onClose={() => setChangeClassOpen(false)}
        reclassPreview={reclassPreview}
        exclude={player.class}
        confirmLabel={(cls) => `Reclass to ${cls}`}
        onConfirm={handleReclass}
      />
    </PageShell>
  );
}
