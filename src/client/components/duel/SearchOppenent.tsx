import { Search, UserPlus, Users } from 'lucide-react';
import { CLASS_META } from '../../../shared/web';
import { classColor } from '../../lib/class-colors';
import type { DuelInvite } from '../../../shared/api';
import type { OpponentEntry } from '../../hooks/useDuel';

interface SearchOpponentProps {
  opponents: OpponentEntry[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pendingOutgoingByOpponent: Map<string, DuelInvite>;
  busyId: string | null;
  onSelectOpponent: (opponent: OpponentEntry) => void;
  onExit: () => void;
}

export function SearchOpponent({
  opponents,
  loading,
  error,
  searchQuery,
  onSearchChange,
  pendingOutgoingByOpponent,
  busyId,
  onSelectOpponent,
  onExit,
}: SearchOpponentProps) {
  const filtered = opponents.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.username.toLowerCase().includes(q) ||
      CLASS_META[o.class].name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Find an opponent
            </p>
            <p className="text-xs text-muted-foreground">
              Choose a rival and send a challenge.
            </p>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Back
          </button>
        </div>
      </div>

      <div className="px-4 pt-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by username or class..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:border-primary outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive text-center py-4">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-center">
            <Users className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No players found' : 'No opponents available yet'}
            </p>
          </div>
        )}

        {filtered.map((opponent) => {
          const color = classColor(opponent.class);
          const pendingInvite = pendingOutgoingByOpponent.get(opponent.userId);
          const isBusy = busyId === opponent.userId;

          return (
            <div
              key={opponent.userId}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
            >
              <div
                className="size-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {opponent.username[0]?.toUpperCase() ?? '?'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {opponent.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {CLASS_META[opponent.class].name}
                </p>
              </div>

              {pendingInvite ? (
                <span className="text-xs text-muted-foreground shrink-0">
                  Invited
                </span>
              ) : (
                <button
                  onClick={() => onSelectOpponent(opponent)}
                  disabled={isBusy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-opacity shrink-0"
                  style={{ backgroundColor: color }}
                >
                  <UserPlus className="size-3.5" />
                  {isBusy ? 'Sending...' : 'Invite'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
