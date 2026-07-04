import {
  ChevronLeft,
  Landmark,
  Search,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { GUILD_MULTIPLIERS } from '../../../shared/api';

type GuildHubViewProps = Readonly<{
  playerColor: string;
  onBack: () => void;
  onCreate: () => void;
  onBrowse: () => void;
}>;

export function GuildHubView({
  playerColor,
  onBack,
  onCreate,
  onBrowse,
}: GuildHubViewProps) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-6 px-6 py-8">
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-3.5" /> Back
      </button>
      <div className="text-center flex flex-col items-center gap-2">
        <Landmark className="size-12 text-foreground mb-3" />
        <h1 className="font-display text-2xl font-bold tracking-wider text-foreground mb-2">
          Guild Hall
        </h1>
        <p className="text-sm text-muted-foreground max-w-64 leading-relaxed">
          Join forces with others. A full guild (all 4 classes) earns{' '}
          <span className="text-primary font-semibold">full multiplier</span> on
          all points.
        </p>
      </div>

      {/* Multiplier info */}
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">
          Guild Multipliers
        </p>
        {[
          {
            label: 'Solo (1 class)',
            mult: GUILD_MULTIPLIERS.SOLO,
            icon: <UserRound className="size-3.5 text-foreground" />,
          },
          {
            label: 'Partial (2-3 classes)',
            mult: GUILD_MULTIPLIERS.PARTIAL,
            icon: <UsersRound className="size-3.5 text-foreground" />,
          },
          {
            label: 'Complete (all 4)',
            mult: GUILD_MULTIPLIERS.COMPLETE,
            icon: <Landmark className="size-3.5 text-foreground" />,
          },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex gap-1 items-center">
              {row.icon} {row.label}
            </span>
            <span
              className="text-sm font-bold flex items-center gap-1"
              style={{ color: playerColor }}
            >
              <X className="size-3.5" /> {row.mult.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col w-full max-w-sm gap-3">
        <button
          onClick={onCreate}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
          style={{ backgroundColor: playerColor }}
        >
          <Landmark className="size-4" /> Found a Guild
        </button>
        <button
          onClick={onBrowse}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border border-border text-foreground bg-card transition-all duration-200 hover:bg-secondary hover:scale-105 active:scale-95"
        >
          <Search className="size-4" /> Browse Guilds
        </button>
      </div>
    </div>
  );
}
