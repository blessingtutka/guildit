import { Trophy } from 'lucide-react';

const MEDALS = ['🥇', '🥈', '🥉'];

type LeaderboardEntry = {
  id: string;
  label: string;
  score: number;
  rank: number;
  isPlayer: boolean;
};

type LeaderboardListProps = Readonly<{
  entries: LeaderboardEntry[];
  color: string;
  emptyMsg: string;
}>;

export function LeaderboardList({
  entries,
  color,
  emptyMsg,
}: LeaderboardListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <Trophy className="size-9 text-foreground" />
        <p className="text-sm text-muted-foreground">{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all ${
            entry.isPlayer ? 'border-2 bg-opacity-10' : 'border-border bg-card'
          }`}
          style={
            entry.isPlayer
              ? { borderColor: color, backgroundColor: `${color}10` }
              : {}
          }
        >
          <div className="w-8 text-center shrink-0">
            {entry.rank <= 3 ? (
              <span className="text-lg">{MEDALS[entry.rank - 1]}</span>
            ) : (
              <span className="text-sm font-bold text-muted-foreground">
                #{entry.rank}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold truncate ${entry.isPlayer ? '' : 'text-foreground'}`}
              style={entry.isPlayer ? { color } : {}}
            >
              {entry.label}
              {entry.isPlayer && (
                <span className="ml-1 text-xs font-normal opacity-70">
                  (you)
                </span>
              )}
            </p>
          </div>
          <span
            className="text-sm font-bold shrink-0"
            style={{ color: entry.rank <= 3 ? color : undefined }}
          >
            {entry.score.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
