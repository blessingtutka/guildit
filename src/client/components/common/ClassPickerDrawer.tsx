import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '../ui/drawer';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CLASS_META } from '../../../shared/web';
import type { PlayerClass, ReclassPreview } from '../../../shared/api';

type ClassPickerDrawerProps = Readonly<{
  open: boolean;
  onClose: () => void;
  initialClass?: PlayerClass | null;
  /** When provided, show reclass tax warning */
  reclassPreview?: ReclassPreview | null;
  /** Label for confirm button */
  confirmLabel?: (cls: PlayerClass) => string;
  onConfirm: (cls: PlayerClass) => Promise<void>;
  /** Exclude one class (e.g. current class) */
  exclude?: PlayerClass | null;
}>;

const ALL_CLASSES: PlayerClass[] = ['RANGER', 'MENDER', 'WARDER', 'WEAVER'];

export function ClassPickerDrawer({
  open,
  onClose,
  initialClass,
  reclassPreview,
  confirmLabel,
  onConfirm,
  exclude,
}: ClassPickerDrawerProps) {
  const available = ALL_CLASSES.filter((c) => c !== exclude);
  const startIdx = initialClass
    ? Math.max(0, available.indexOf(initialClass))
    : 0;
  const [idx, setIdx] = useState(startIdx);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setIdx(startIdx);
      setError(null);
    }
  }, [open, startIdx]);

  const cls = available[idx] as PlayerClass | undefined;
  if (!cls) return null;

  const meta = CLASS_META[cls];
  const total = available.length;

  const prev = () => setIdx((i) => (i === 0 ? total - 1 : i - 1));
  const next = () => setIdx((i) => (i === total - 1 ? 0 : i + 1));

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(cls);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-center pb-0">
          <DrawerTitle className="font-display tracking-widest text-lg">
            Choose Your Class
          </DrawerTitle>
          <DrawerDescription className="text-xs">
            {total > 1 ? `${idx + 1} / ${total}` : cls}
          </DrawerDescription>
        </DrawerHeader>

        {/* Carousel body */}
        <div className="flex flex-col items-center gap-4 px-6 py-4 overflow-y-auto">
          {/* Navigation + class display */}
          <div className="flex items-center gap-3 w-full max-w-xs">
            {total > 1 && (
              <button
                type="button"
                onClick={prev}
                className="shrink-0 w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}

            {/* Class card */}
            <div
              className="flex-1 flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all duration-300"
              style={{ borderColor: meta.color, backgroundColor: `${meta.color}12` }}
            >
              {meta.image ? (
                <img
                  src={`/images/${meta.image}`}
                  alt={meta.name}
                  className="w-20 h-20 object-contain animate-bounce-subtle"
                />
              ) : (
                <span className="text-5xl animate-bounce-subtle">{meta.icon}</span>
              )}
              <div>
                <p className="font-display text-xl font-bold" style={{ color: meta.color }}>
                  {meta.name}
                </p>
                <p className="text-xs text-muted-foreground italic mt-0.5">{meta.tagline}</p>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{meta.description}</p>

              {/* Affinity badges */}
              <div className="flex flex-wrap gap-1 justify-center">
                {meta.affinity.map((a) => (
                  <Badge key={a} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {a.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            {total > 1 && (
              <button
                type="button"
                onClick={next}
                className="shrink-0 w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>

          {/* Pagination dots */}
          {total > 1 && (
            <div className="flex gap-1.5">
              {available.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === idx ? '24px' : '6px',
                    backgroundColor: i === idx ? meta.color : 'var(--color-border)',
                  }}
                  aria-label={`Select class ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Reclass warning */}
          {reclassPreview && (
            <div className="w-full max-w-xs rounded-xl border border-destructive/30 bg-destructive/5 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <TriangleAlert className="size-3.5" />
                Reclass Tax
              </div>
              <p className="text-xs text-muted-foreground">
                Switching costs{' '}
                <span className="font-bold text-destructive">
                  {reclassPreview.cost.toLocaleString()} pts ({reclassPreview.taxRate}%)
                </span>
                . You'll drop from Level {reclassPreview.currentLevel} → Level{' '}
                {reclassPreview.newLevel}.
              </p>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}
        </div>

        <DrawerFooter className="pt-2">
          <Button
            onClick={() => void handleConfirm()}
            disabled={loading}
            className="w-full font-bold py-3 rounded-xl text-white"
            style={{ backgroundColor: meta.color, border: 'none' }}
          >
            {loading
              ? 'Applying...'
              : (confirmLabel ? confirmLabel(cls) : `Become a ${meta.name}`)}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading} className="w-full">
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
