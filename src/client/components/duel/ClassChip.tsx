import { CLASS_META } from '../../../shared/web';
import type { PlayerClass } from '../../../shared/api';
import { ClassIcon } from '../common/ClassIcon';
import { UserPlus } from 'lucide-react';

type ClassChipProps = Readonly<{
  cls?: PlayerClass | undefined;
  label: string;
  color?: string;
}>;

export function ClassChip({ cls, label, color }: ClassChipProps) {
  if (!cls) {
    return (
      <div className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border border-dashed border-muted-foreground text-muted-foreground">
        <UserPlus className="size-3" />
        <span className="text-xs font-bold">Invite a player</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    );
  }

  const meta = CLASS_META[cls];

  return (
    <div
      className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border"
      style={{
        borderColor: color,
        backgroundColor: `${color}10`,
      }}
    >
      <ClassIcon classMeta={meta} className="size-3" />
      <span className="text-xs font-bold" style={{ color }}>
        {meta.name}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
