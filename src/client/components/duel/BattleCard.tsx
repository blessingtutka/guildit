type CardData = {
  label: string;
  value: number;
  emoji: string;
};

type BattleCardProps = Readonly<{
  card: CardData | null;
  color: string;
  isRevealing: boolean;
}>;

export function BattleCard({ card, color, isRevealing }: BattleCardProps) {
  return (
    <div
      className={`w-28 h-40 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
        card ? 'scale-100' : 'scale-95 opacity-60'
      } ${isRevealing ? 'animate-pulse' : ''}`}
      style={{
        borderColor: card ? color : 'var(--color-border)',
        backgroundColor: card ? `${color}15` : 'var(--color-card)',
      }}
    >
      {card ? (
        <>
          <span className="text-3xl">{card.emoji}</span>
          <span className="text-xs font-bold" style={{ color }}>
            {card.label}
          </span>
          <span className="text-lg font-black" style={{ color }}>
            {card.value}
          </span>
        </>
      ) : (
        <span className="text-3xl">🃏</span>
      )}
    </div>
  );
}
