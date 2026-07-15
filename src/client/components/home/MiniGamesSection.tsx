import React from 'react';
import type { GuildStatus } from '../../../shared/api';
import type { AppPage } from '../../pages/HomePage';
import { Swords, Lock, ArrowRight, Sword, Skull } from 'lucide-react';

type MiniGamesSectionProps = Readonly<{
  color: string;
  guild: GuildStatus | null;
  onNavigate: (page: AppPage) => void;
}>;

type GameCardProps = Readonly<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  locked?: boolean;
  lockedMsg?: string;
  onClick: () => void;
}>;

function GameCard({
  icon,
  title,
  subtitle,
  badge,
  color,
  locked = false,
  lockedMsg,
  onClick,
}: GameCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={`w-full flex items-center gap-4 bg-card border rounded-2xl px-4 py-3.5 text-left transition-all duration-200 ${
        locked
          ? 'opacity-40 cursor-not-allowed border-border'
          : 'hover:scale-[1.02] hover:shadow-md active:scale-[0.99] cursor-pointer'
      }`}
      style={!locked ? { borderColor: `${color}` } : {}}
    >
      <span className="text-3xl shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-bold text-foreground">{title}</p>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={!locked ? { backgroundColor: `${color}18`, color } : {}}
          >
            {badge}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {locked && lockedMsg ? lockedMsg : subtitle}
        </p>
      </div>
      {locked ? (
        <Lock className="w-7 h-7 text-muted-foreground shrink-0 text-sm" />
      ) : (
        <ArrowRight className="w-7 h-7 text-muted-foreground shrink-0 text-sm" />
      )}
    </button>
  );
}

export function MiniGamesSection({
  color,
  guild,
  onNavigate,
}: MiniGamesSectionProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">
        Mini-Games
      </p>
      <div className="space-y-2">
        <GameCard
          icon={<Sword className="w-7 h-7 text-foreground" />}
          title="Solo Trial"
          subtitle="Flip all 4 action cards to complete your trial"
          badge="SOLO"
          color={color}
          onClick={() => onNavigate('solo-trial')}
        />
        <GameCard
          icon={<Swords className="w-7 h-7 text-foreground" />}
          title="Class Duel"
          subtitle="3 rounds of card combat vs. a rival class"
          badge="DUO"
          color={color}
          onClick={() => onNavigate('duel')}
        />
        <GameCard
          icon={<Skull className="w-7 h-7 text-foreground" />}
          title="Guild Raid"
          subtitle="Battle 3 waves of enemies with your guild"
          badge="GUILD"
          color={color}
          locked={!guild}
          lockedMsg="Requires a guild"
          onClick={() => guild && onNavigate('guild-raid')}
        />
      </div>
    </div>
  );
}
