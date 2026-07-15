import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { PageShell } from '../components/common/PageShell';
import { RaidIntroView } from '../components/guild-raid/RaidIntroView';
import { RaidBattleView } from '../components/guild-raid/RaidBattleView';
import { RaidResultView } from '../components/guild-raid/RaidResultView';
import { useAction } from '../hooks/useAction';
import { ACTION_LABELS } from '../../shared/web';
import { classColor } from '../lib/class-colors';
import type {
  Player,
  PlayerClass,
  ActionType,
  GuildStatus,
} from '../../shared/api';
import { CLASS_ACTIONS } from '../../shared/api';

type GuildRaidPageProps = Readonly<{
  player: Player & { level: number };
  guild: GuildStatus;
  onPlayerUpdate: (p: Player & { level: number }) => void;
  onBack: () => void;
}>;

type RaidPhase = 'intro' | 'battle' | 'result';

const RAID_WAVES = 3;

function generateBossWave(wave: number): {
  name: string;
  power: number;
  emoji: string;
} {
  const bosses: { name: string; emoji: string; power: number }[] = [
    { name: 'The Void Troll', emoji: '👹', power: 80 + wave * 15 },
    { name: 'Chaos Weaver', emoji: '🕷️', power: 70 + wave * 20 },
    { name: 'Silence Ranger', emoji: '🦅', power: 90 + wave * 10 },
  ];
  return (bosses[wave % bosses.length] ?? bosses[0]) as {
    name: string;
    power: number;
    emoji: string;
  };
}

export function GuildRaidPage({
  player,
  guild,
  onPlayerUpdate,
  onBack,
}: GuildRaidPageProps) {
  const ACTIONS_ENABLED = false;
  const playerClass = player.class as PlayerClass;
  const playerColor = classColor(playerClass);
  const actions = CLASS_ACTIONS[playerClass];

  const [phase, setPhase] = useState<RaidPhase>('intro');
  const [wave, setWave] = useState(0);
  const [boss, setBoss] = useState(generateBossWave(0));
  const [bossHp, setBossHp] = useState(100);
  const [guildHp, setGuildHp] = useState(100);
  const [totalDamage, setTotalDamage] = useState(0);
  const [flashing, setFlashing] = useState<'boss' | 'guild' | null>(null);

  const {
    statuses,
    performGuildRaidAttack,
    fetchAllStatuses,
    error,
    clearError,
  } = useAction(player.userId);

  useEffect(() => {
    void fetchAllStatuses(actions);
  }, [fetchAllStatuses, actions]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleAttack = useCallback(
    async (action: ActionType) => {
      if (!ACTIONS_ENABLED) {
        toast.info('⛔ Actions are disabled (under construction)');
        return;
      }

      // Call the placeholder with the real player
      const result = await performGuildRaidAttack(action, player);
      if (!result) return;

      // Update the parent with the new player (points updated)
      onPlayerUpdate(result.player);

      const dmg = result.pointsEarned;
      setTotalDamage((t) => t + dmg);

      // Damage boss
      const newBossHp = Math.max(0, bossHp - Math.floor(dmg * 0.8));
      setFlashing('boss');
      setTimeout(() => setFlashing(null), 400);
      setBossHp(newBossHp);

      // Boss counterattacks
      const bossDmg = Math.floor(boss.power * 0.15 * Math.random());
      const newGuildHp = Math.max(0, guildHp - bossDmg);
      setTimeout(() => {
        setFlashing('guild');
        setTimeout(() => setFlashing(null), 400);
        setGuildHp(newGuildHp);
      }, 500);

      toast.success(
        `⚔️ ${ACTION_LABELS[action].label}! -${Math.floor(dmg * 0.8)} boss HP`
      );

      // Check win/lose conditions
      if (newBossHp <= 0) {
        const nextWave = wave + 1;
        if (nextWave >= RAID_WAVES) {
          setPhase('result');
        } else {
          setWave(nextWave);
          setBoss(generateBossWave(nextWave));
          setBossHp(100);
          toast.success(`Wave ${wave + 1} cleared! Next wave incoming...`);
        }
      } else if (newGuildHp <= 0) {
        setPhase('result');
      }
    },
    [
      ACTIONS_ENABLED,
      performGuildRaidAttack,
      player,
      onPlayerUpdate,
      bossHp,
      boss.power,
      guildHp,
      wave,
    ]
  );

  const isComplete = phase === 'result';
  const victory =
    isComplete && guildHp > 0 && (bossHp <= 0 || wave >= RAID_WAVES - 1);

  const handleReset = () => {
    setPhase('intro');
    setWave(0);
    setBoss(generateBossWave(0));
    setBossHp(100);
    setGuildHp(100);
    setTotalDamage(0);
  };

  return (
    <PageShell player={player} onBack={onBack} title="Guild Raid">
      <div className="flex min-h-full flex-col bg-background">
        {phase === 'intro' && (
          <RaidIntroView
            guild={guild}
            playerColor={playerColor}
            onStart={() => setPhase('battle')}
            onBack={onBack}
          />
        )}

        {phase === 'battle' && (
          <RaidBattleView
            actions={actions}
            statuses={statuses}
            playerColor={playerColor}
            guild={guild}
            wave={wave}
            boss={boss}
            bossHp={bossHp}
            guildHp={guildHp}
            flashing={flashing}
            onAttack={(action) => void handleAttack(action)}
          />
        )}

        {phase === 'result' && (
          <RaidResultView
            victory={victory}
            wave={wave}
            totalDamage={totalDamage}
            guildHp={guildHp}
            multiplier={guild.multiplier}
            playerColor={playerColor}
            onReset={handleReset}
            onBack={onBack}
          />
        )}
      </div>
    </PageShell>
  );
}
