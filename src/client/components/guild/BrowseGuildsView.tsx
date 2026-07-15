import { ArrowRight, ChevronLeft, Landmark } from 'lucide-react';
import { useState } from 'react';

type GuildEntry = { guildId: string; name: string; score: number };

type BrowseGuildsViewProps = Readonly<{
  guilds: GuildEntry[];
  loading: boolean;
  playerColor: string;
  joiningId: string | null;
  onBack: () => void;
  onCreate: () => void;
  onJoin: (guildId: string) => void;
}>;

export function BrowseGuildsView({
  guilds,
  loading,
  playerColor,
  joiningId,
  onBack,
  onCreate,
  onJoin,
}: BrowseGuildsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = guilds.filter((g) =>
    searchQuery
      ? g.guildId.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="flex flex-col flex-1 px-4 py-4 gap-4 overflow-hidden">
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="size-3.5" /> Back
        </button>
        <h2 className="font-display text-lg font-bold tracking-wide text-foreground">
          Open Guilds
        </h2>
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search guilds..."
        className="shrink-0 w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all"
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Loading...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <Landmark className=" size-7.5 text-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No guilds found. Be the first to found one!
          </p>
          <button
            onClick={onCreate}
            className="text-sm font-semibold flex gap-1 items-center"
            style={{ color: playerColor }}
          >
            Found a Guild <ArrowRight className=" size-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.map((g) => (
            <div
              key={g.guildId}
              className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {g.name || g.guildId.replace(/^guild_\d+_/, '')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Score: {g.score.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => onJoin(g.guildId)}
                disabled={joiningId === g.guildId}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: playerColor }}
              >
                {joiningId === g.guildId ? '...' : 'Join'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
