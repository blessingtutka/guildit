import { useState, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { DuelSetupView } from '../components/duel/DuelSetupView';
import { DuelBattleView } from '../components/duel/DuelBattleView';
import { DuelResultView } from '../components/duel/DuelResultView';
import { CLASS_META } from '../../shared/web';
import { classColor } from '../lib/class-colors';
import type { Player, PlayerClass } from '../../shared/api';
import { DUEL_ADVANTAGE, DUEL_ADVANTAGE_MULTIPLIER } from '../../shared/api';

type DuelPageProps = Readonly<{
  player: Player & { level: number };
  onBack: () => void;
}>;

type DuelPhase = 'setup' | 'draw' | 'resolve' | 'result';

type CardData = {
  label: string;
  value: number;
  emoji: string;
};

const CLASS_CARDS: Record<PlayerClass, CardData[]> = {
  RANGER: [
    { label: 'Scout', value: 6, emoji: '🔭' },
    { label: 'Ambush', value: 9, emoji: '🏹' },
    { label: 'Track', value: 7, emoji: '👣' },
    { label: 'Waypoint', value: 5, emoji: '🗺️' },
  ],
  MENDER: [
    { label: 'Heal', value: 7, emoji: '💚' },
    { label: 'Bolster', value: 8, emoji: '✨' },
    { label: 'Sanctuary', value: 10, emoji: '🌿' },
    { label: 'Revive', value: 6, emoji: '💫' },
  ],
  WARDER: [
    { label: 'Shield', value: 8, emoji: '🛡️' },
    { label: 'Guard', value: 9, emoji: '⚔️' },
    { label: 'Fortify', value: 7, emoji: '🏰' },
    { label: 'Verdict', value: 6, emoji: '⚖️' },
  ],
  WEAVER: [
    { label: 'Invoke', value: 9, emoji: '🌀' },
    { label: 'Craft', value: 8, emoji: '🎨' },
    { label: 'Inspire', value: 10, emoji: '💡' },
    { label: 'Enchant', value: 7, emoji: '✨' },
  ],
};

const ALL_CLASSES: PlayerClass[] = ['RANGER', 'MENDER', 'WARDER', 'WEAVER'];

function randomOpponent(exclude: PlayerClass): PlayerClass {
  const others = ALL_CLASSES.filter((c) => c !== exclude);
  return (others[Math.floor(Math.random() * others.length)] ??
    ALL_CLASSES[0]) as PlayerClass;
}

function pickCard(cls: PlayerClass): CardData {
  const deck = CLASS_CARDS[cls];
  return (deck[Math.floor(Math.random() * deck.length)] ?? deck[0]) as CardData;
}

// Need CLASS_META for the reset fallback - already imported above via web.ts
void CLASS_META;

export function DuelPage({ player, onBack }: DuelPageProps) {
  const playerClass = player.class as PlayerClass;
  const playerColor = classColor(playerClass);

  const [phase, setPhase] = useState<DuelPhase>('setup');
  const [opponentClass, setOpponentClass] = useState<PlayerClass>(
    randomOpponent(playerClass)
  );
  const [playerCard, setPlayerCard] = useState<CardData | null>(null);
  const [opponentCard, setOpponentCard] = useState<CardData | null>(null);
  const [winner, setWinner] = useState<'player' | 'opponent' | 'tie' | null>(
    null
  );
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [round, setRound] = useState(1);
  const [isResolving, setIsResolving] = useState(false);

  const opponentColor = classColor(opponentClass);
  const hasAdvantage = DUEL_ADVANTAGE[playerClass] === opponentClass;
  const opponentHasAdvantage = DUEL_ADVANTAGE[opponentClass] === playerClass;

  const handleDraw = useCallback(() => {
    const pCard = pickCard(playerClass);
    const oCard = pickCard(opponentClass);
    setPlayerCard(pCard);
    setOpponentCard(oCard);
    setIsResolving(true);
    setPhase('resolve');

    setTimeout(() => {
      let pScore = pCard.value;
      let oScore = oCard.value;

      if (hasAdvantage) pScore *= DUEL_ADVANTAGE_MULTIPLIER;
      if (opponentHasAdvantage) oScore *= DUEL_ADVANTAGE_MULTIPLIER;

      const pDmg = Math.max(0, Math.round(oScore * 10));
      const oDmg = Math.max(0, Math.round(pScore * 10));

      const newPlayerHp = Math.max(0, playerHp - pDmg);
      const newOpponentHp = Math.max(0, opponentHp - oDmg);

      setPlayerHp(newPlayerHp);
      setOpponentHp(newOpponentHp);
      setIsResolving(false);

      if (newPlayerHp === 0 || newOpponentHp === 0 || round >= 3) {
        if (newPlayerHp > newOpponentHp) {
          setWinner('player');
        } else if (newOpponentHp > newPlayerHp) {
          setWinner('opponent');
        } else {
          setWinner('tie');
        }
        setPhase('result');
      } else {
        setRound((r) => r + 1);
        setPhase('draw');
        setPlayerCard(null);
        setOpponentCard(null);
      }
    }, 1200);
  }, [
    playerClass,
    opponentClass,
    hasAdvantage,
    opponentHasAdvantage,
    playerHp,
    opponentHp,
    round,
  ]);

  const handleReset = () => {
    const newOpp = randomOpponent(playerClass);
    setOpponentClass(newOpp);
    setPhase('setup');
    setPlayerCard(null);
    setOpponentCard(null);
    setWinner(null);
    setPlayerHp(100);
    setOpponentHp(100);
    setRound(1);
  };

  return (
    <div className="flex flex-col w-full min-h-full bg-background overflow-hidden">
      <Header player={player} />

      {phase === 'setup' && (
        <DuelSetupView
          playerClass={playerClass}
          playerColor={playerColor}
          opponentClass={opponentClass}
          opponentColor={opponentColor}
          hasAdvantage={hasAdvantage}
          opponentHasAdvantage={opponentHasAdvantage}
          onStart={() => setPhase('draw')}
          onNewOpponent={handleReset}
          onBack={onBack}
        />
      )}

      {(phase === 'draw' || phase === 'resolve') && (
        <DuelBattleView
          playerClass={playerClass}
          playerColor={playerColor}
          opponentClass={opponentClass}
          opponentColor={opponentColor}
          playerHp={playerHp}
          opponentHp={opponentHp}
          playerCard={playerCard}
          opponentCard={opponentCard}
          round={round}
          phase={phase as 'draw' | 'resolve'}
          isResolving={isResolving}
          username={player.username}
          onDraw={handleDraw}
        />
      )}

      {phase === 'result' && winner && (
        <DuelResultView
          winner={winner}
          playerClass={playerClass}
          playerColor={playerColor}
          opponentClass={opponentClass}
          opponentColor={opponentColor}
          playerHp={playerHp}
          opponentHp={opponentHp}
          onReset={handleReset}
          onBack={onBack}
        />
      )}
    </div>
  );
}
