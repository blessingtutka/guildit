import { ProgressBar } from '../common/ProgressBar';
import { ACTION_LABELS } from '../../../shared/web';
import { ACTION_BASE_POINTS, ACTION_DAILY_CAPS } from '../../../shared/api';
import type {
  ActionStatus,
  ActionType,
  GuildStatus,
} from '../../../shared/api';

const RAID_WAVES = 3;

type BossData = { name: string; power: number; emoji: string };

type RaidBattleViewProps = Readonly<{
  actions: ActionType[];
  statuses: Partial<Record<ActionType, ActionStatus>>;
  playerColor: string;
  guild: GuildStatus;
  wave: number;
  boss: BossData;
  bossHp: number;
  guildHp: number;
  flashing: 'boss' | 'guild' | null;
  onAttack: (action: ActionType) => void;
}>;

export function RaidBattleView({
  actions,
  statuses,
  playerColor,
  guild,
  wave,
  boss,
  bossHp,
  guildHp,
  flashing,
  onAttack,
}: RaidBattleViewProps) {
  return (
    <div className="flex flex-col flex-1 px-4 py-4 gap-4 overflow-y-auto">
      {/* Wave indicator */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          Wave {wave + 1}/{RAID_WAVES}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: RAID_WAVES }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  i <= wave ? playerColor : 'var(--color-border)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Boss card */}
      <div
        className={`bg-card border-2 rounded-2xl p-5 text-center transition-all duration-200 ${
          flashing === 'boss' ? 'scale-95 border-destructive' : ''
        }`}
        style={{
          borderColor:
            flashing === 'boss'
              ? 'var(--color-destructive)'
              : 'var(--color-border)',
        }}
      >
        <span className="text-4xl animate-bounce-subtle block mb-2">
          {boss.emoji}
        </span>
        <p className="font-display text-lg font-bold text-foreground mb-1">
          {boss.name}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Power: {boss.power}
        </p>
        <ProgressBar
          value={bossHp}
          color="var(--color-destructive)"
          showLabel
          label="Boss HP"
          animated
        />
      </div>

      {/* Guild HP */}
      <div
        className={`bg-card border rounded-xl px-4 py-3 transition-all duration-200 ${
          flashing === 'guild' ? 'scale-95' : ''
        }`}
        style={{
          borderColor:
            flashing === 'guild' ? playerColor : 'var(--color-border)',
        }}
      >
        <ProgressBar
          value={guildHp}
          color={playerColor}
          showLabel
          label={`${guild.guild.name} HP`}
          animated
        />
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          Attack with your actions
        </p>
        {actions.map((action) => {
          const status = statuses[action];
          const cap = ACTION_DAILY_CAPS[action];
          const remaining = status?.remaining ?? cap;
          const used = status?.usedToday ?? 0;
          const exhausted = remaining <= 0;

          return (
            <button
              key={action}
              type="button"
              onClick={() => onAttack(action)}
              disabled={exhausted}
              className={`w-full flex items-center justify-between bg-card border rounded-xl px-4 py-3 transition-all duration-200 text-left ${
                exhausted
                  ? 'opacity-40 cursor-not-allowed border-border'
                  : 'hover:scale-[1.02] hover:shadow-md active:scale-[0.99] cursor-pointer'
              }`}
              style={exhausted ? {} : { borderColor: `${playerColor}` }}
            >
              <div>
                <p
                  className="text-sm font-bold"
                  style={exhausted ? {} : { color: playerColor }}
                >
                  {ACTION_LABELS[action].label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ACTION_LABELS[action].description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className="text-sm font-bold"
                  style={exhausted ? {} : { color: playerColor }}
                >
                  -{Math.floor(ACTION_BASE_POINTS[action] * 0.8)} HP
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: cap }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          i < used ? playerColor : 'var(--color-border)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
