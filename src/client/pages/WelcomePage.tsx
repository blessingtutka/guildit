import { useState } from 'react';
import { PageShell } from '../components/common/PageShell';
import { ClassPickerDrawer } from '../components/common/ClassPickerDrawer';
import { ClassCard } from '../components/common/ClassCard';
import { Badge } from '../components/ui/badge';
import { CLASS_META } from '../../shared/web';
import type { Player, PlayerClass } from '../../shared/api';
import type { ClassMeta } from '../../shared/web';

type WelcomePageProps = Readonly<{
  player: Player;
  onClassSelect: (cls: PlayerClass) => Promise<void>;
}>;

export function WelcomePage({ player, onClassSelect }: WelcomePageProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [startClass, setStartClass] = useState<PlayerClass | null>(null);

  const classList = Object.values(CLASS_META) as ClassMeta[];

  const openDrawer = (cls: PlayerClass) => {
    setStartClass(cls);
    setDrawerOpen(true);
  };

  return (
    <PageShell player={player}>
      <div className="flex flex-col gap-5 px-4 pt-5 pb-8">
        {/* Header copy */}
        <div className="text-center">
          <h1 className="font-display text-xl font-bold tracking-wider text-foreground mb-1">
            Choose Your Class
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your class shapes how you earn points and serve your guild.
          </p>
          <Badge variant="outline" className="mt-2 text-xs gap-1 border-primary/40 text-primary">
            ⚠️ Permanent — reclassing later costs points
          </Badge>
        </div>

        {/* Class grid */}
        <div className="grid grid-cols-2 gap-3">
          {classList.map((meta) => (
            <ClassCard
              key={meta.key}
              meta={meta}
              onSelect={openDrawer}
              onClick={() => openDrawer(meta.key)}
            />
          ))}
        </div>
      </div>

      {/* Class picker drawer */}
      <ClassPickerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialClass={startClass}
        onConfirm={onClassSelect}
        confirmLabel={(cls) => `Become a ${CLASS_META[cls].name}`}
      />
    </PageShell>
  );
}
