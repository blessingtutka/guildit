import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { LeaderboardList } from './LeaderboardList';
import { CLASS_META } from '../../../shared/web';
import { CLASS_COLORS, classColor } from '../../lib/class-colors';
import type { Player, PlayerClass } from '../../../shared/api';
import { ClassIcon } from '../common/ClassIcon';
import { Landmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

type GuildEntry = { guildId: string; name: string; score: number };
type ClassEntry = { userId: string; username: string; score: number };

type LeaderboardTabsProps = Readonly<{
  player: Player & { level: number };
  classBoards: Partial<Record<PlayerClass, ClassEntry[]>>;
  guildBoard: GuildEntry[];
  loading: boolean;
}>;

const CLASSES: PlayerClass[] = ['RANGER', 'MENDER', 'WARDER', 'WEAVER'];

export function LeaderboardTabs({
  player,
  classBoards,
  guildBoard,
  loading,
}: LeaderboardTabsProps) {
  const playerColor = classColor(player.class);

  const tabsRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    tabsRef.current?.scrollBy({
      left: direction === 'left' ? -180 : 180,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="text-muted-foreground text-sm">Loading ranks...</span>
      </div>
    );
  }

  return (
    <Tabs defaultValue="guilds" className="flex-1 flex flex-col min-h-0">
      <div className="relative shrink-0 border-b border-border">
        {/* Left */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/90 backdrop-blur flex items-center justify-center shadow"
        >
          <ChevronLeft className="size-4" />
        </button>

        {/* Scroll Area */}
        <div
          ref={tabsRef}
          className="
      overflow-x-auto
      overflow-y-hidden
      scrollbar-none
      scroll-smooth
      px-10
    "
        >
          <TabsList
            className="
        inline-flex
        w-max
        flex-nowrap
        gap-1
        bg-transparent
        rounded-none
        h-auto
        py-2
      "
          >
            <TabsTrigger
              value="guilds"
              className="shrink-0 flex items-center gap-1 p-2"
            >
              <Landmark className="size-4" />
              Guilds
            </TabsTrigger>

            {CLASSES.map((cls) => (
              <TabsTrigger
                key={cls}
                value={cls}
                className="shrink-0 flex items-center gap-1 p-2"
              >
                <ClassIcon classMeta={CLASS_META[cls]} className="size-3" />
                {CLASS_META[cls].name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Right */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/90 backdrop-blur flex items-center justify-center shadow"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <TabsContent value="guilds" className="px-4 py-4 mt-0">
          <LeaderboardList
            entries={guildBoard.map((g, i) => ({
              id: g.guildId,
              label: g.name,
              score: g.score,
              rank: i + 1,
              isPlayer: player.guildId === g.guildId,
            }))}
            color={playerColor}
            emptyMsg="No guilds yet. Be the first to found one!"
          />
        </TabsContent>

        {CLASSES.map((cls) => (
          <TabsContent key={cls} value={cls} className="px-4 py-4 mt-0">
            <LeaderboardList
              entries={(classBoards[cls] ?? []).map((e, i) => ({
                id: e.userId,
                label: e.username,
                score: e.score,
                rank: i + 1,
                isPlayer: player.userId === e.userId,
              }))}
              color={CLASS_COLORS[cls]}
              emptyMsg={`No ${CLASS_META[cls].name}s on the board yet.`}
            />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
