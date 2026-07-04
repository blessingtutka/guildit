import type { PlayerClass } from '../../shared/api';

export const CLASS_COLORS: Record<PlayerClass, string> = {
  RANGER: 'var(--color-ranger)',
  MENDER: 'var(--color-mender)',
  WARDER: 'var(--color-warder)',
  WEAVER: 'var(--color-weaver)',
};

export function classColor(cls: PlayerClass | null | undefined): string {
  return cls ? CLASS_COLORS[cls] : 'var(--color-primary)';
}
