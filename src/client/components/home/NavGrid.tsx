import { Trophy, Zap } from 'lucide-react';
import type { AppPage } from '../../pages/HomePage';

type NavGridProps = Readonly<{
  color: string;
  onNavigate: (page: AppPage) => void;
}>;

type NavCardProps = Readonly<{
  // eslint-disable-next-line no-undef
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  onClick: () => void;
}>;

function NavCard({ icon, title, subtitle, color, onClick }: NavCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-2 bg-card border border-border rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
      style={{ borderColor: `${color}` }}
    >
      {icon}
      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-snug">{subtitle}</p>
      </div>
    </button>
  );
}

export function NavGrid({ color, onNavigate }: NavGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <NavCard
        icon={<Zap className="w-7 h-7 text-foreground" />}
        title="Daily Actions"
        subtitle="Earn points with class actions"
        color={color}
        onClick={() => onNavigate('actions')}
      />
      <NavCard
        icon={<Trophy className="w-7 h-7 text-foreground" />}
        title="Leaderboard"
        subtitle="Top players & guilds"
        color={color}
        onClick={() => onNavigate('leaderboard')}
      />
    </div>
  );
}
