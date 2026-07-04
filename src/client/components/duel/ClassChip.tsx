import { CLASS_META } from '../../../shared/web';
import type { PlayerClass } from '../../../shared/api';
import { ClassIcon } from '../common/ClassIcon';

type ClassChipProps = Readonly<{
  cls: PlayerClass;
  label: string;
  color: string;
}>;

export function ClassChip({ cls, label, color }: ClassChipProps) {
  const meta = CLASS_META[cls];
  return (
    <div
      className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border"
      style={{ borderColor: `${color}`, backgroundColor: `${color}10` }}
    >
      <ClassIcon classMeta={meta} className="size-3" />
      <span className="text-xs font-bold" style={{ color }}>
        {meta.name}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
