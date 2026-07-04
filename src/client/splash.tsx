/* eslint-disable react-refresh/only-export-components */
import './index.css';

import { requestExpandedMode, context } from '@devvit/web/client';
import React, { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { PlayerClass } from '../shared/api';
import { CLASS_META } from '../shared/web';
import { Landmark, Swords } from 'lucide-react';
import { ClassIcon } from './components/common/ClassIcon';

type Stats = {
  totalPlayers: number;
  guildCount: number;
  byClass: Record<PlayerClass, number>;
};

const CLASS_ORDER: PlayerClass[] = ['RANGER', 'MENDER', 'WARDER', 'WEAVER'];

const Splash = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/leaderboard/stats')
      .then((r) => r.json() as Promise<Stats>)
      .then(setStats)
      .catch(() => {
        // silently fail — stats are cosmetic
      });
  }, []);

  return (
    <div className="flex relative flex-col justify-center items-center min-h-screen gap-5 bg-background overflow-hidden px-5">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 35%, rgba(139,94,60,0.18), transparent 65%)',
        }}
      />

      {/* Logo */}
      <div className="flex flex-col items-center gap-1.5 relative">
        <img
          src="/logo.png"
          alt="Guildit Logo"
          className="h-16 animate-bounce-subtle"
        />
        <h1 className="font-display text-4xl font-black tracking-[0.2em] text-primary">
          GUILDIT
        </h1>
        <p className="text-sm text-muted-foreground italic text-center">
          Choose your class. Forge your guild. Leave your mark.
        </p>
      </div>

      {/* Stats bar */}
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl px-4 py-3 flex justify-around gap-2">
        <StatPill
          label="Adventurers"
          value={stats?.totalPlayers ?? '—'}
          icon={<Swords className="size-5 text-foreground" />}
        />
        <div className="w-px bg-border self-stretch" />
        <StatPill
          label="Guilds"
          value={stats?.guildCount ?? '—'}
          icon={<Landmark className="size-5 text-foreground" />}
        />
      </div>

      {/* Per-class counts */}
      <div className="relative w-full max-w-sm grid grid-cols-4 gap-2">
        {CLASS_ORDER.map((cls) => {
          const meta = CLASS_META[cls];
          const count = stats?.byClass[cls] ?? null;
          return (
            <div
              key={cls}
              className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-xl py-2.5 px-1"
              style={{ borderColor: `${meta.color}35` }}
            >
              <ClassIcon classMeta={meta} />

              <span
                className="text-xs font-bold leading-none"
                style={{ color: meta.color }}
              >
                {meta.name}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {count ?? '—'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Welcome + CTA */}
      <div className="flex flex-col items-center gap-3 relative w-full max-w-sm">
        <p className="text-sm text-muted-foreground text-center">
          Ready,{' '}
          <span className="font-semibold text-foreground">
            {context.username ?? 'adventurer'}
          </span>
          ? Your class awaits.
        </p>
        <button
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-full cursor-pointer transition-all hover:scale-[1.03] hover:shadow-lg active:scale-[0.97] text-base"
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
        >
          <Swords className="size-5" /> Pick Your Class
        </button>
      </div>
    </div>
  );
};

function StatPill({
  label,
  value,
  icon,
}: Readonly<{ label: string; value: number | string; icon: React.ReactNode }>) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {icon}
      <span className="text-base font-black text-foreground leading-none tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
