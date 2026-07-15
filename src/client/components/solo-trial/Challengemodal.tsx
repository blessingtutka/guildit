import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '../ui/drawer';
import { Button } from '../ui/button';
import type { ClientChallenge } from '../../../shared/api';

type Phase = 'answering' | 'submitting' | 'result';

type ChallengeModalProps = Readonly<{
  challenge: ClientChallenge | null;
  color: string;
  open: boolean;
  onSubmit: (
    optionId: string
  ) => Promise<{ correct: boolean; explanation?: string } | null>;
  onClose: () => void;
}>;

export function ChallengeModal({
  challenge,
  color,
  open,
  onSubmit,
  onClose,
}: ChallengeModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('answering');
  const [outcome, setOutcome] = useState<{
    correct: boolean;
    explanation?: string;
  } | null>(null);

  if (!challenge) return null;

  const handleSelect = async (optionId: string) => {
    if (phase !== 'answering') return;
    setSelected(optionId);
    setPhase('submitting');

    const result = await onSubmit(optionId);
    if (result) {
      setOutcome(result);
      setPhase('result');
    } else {
      setPhase('answering');
      setSelected(null);
    }
  };

  const handleClose = () => {
    setSelected(null);
    setPhase('answering');
    setOutcome(null);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => !v && phase === 'result' && handleClose()}
    >
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle
            className="font-display tracking-widest text-lg"
            style={{ color }}
          >
            {phase === 'result'
              ? outcome?.correct
                ? 'Correct!'
                : 'Not Quite'
              : 'Trial Question'}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 py-4 flex flex-col gap-3">
          <p className="text-sm text-foreground text-center leading-relaxed">
            {challenge.prompt}
          </p>

          <div className="flex flex-col gap-2 mt-2">
            {challenge.options.map((opt) => {
              const isSelected = selected === opt.id;
              const showResult = phase === 'result' && isSelected;

              return (
                <button
                  key={opt.id}
                  onClick={() => void handleSelect(opt.id)}
                  disabled={phase !== 'answering'}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl border text-left text-sm transition-colors disabled:cursor-default"
                  style={{
                    borderColor: isSelected ? color : 'var(--color-border)',
                    backgroundColor: isSelected ? `${color}15` : 'transparent',
                  }}
                >
                  <span className="text-foreground">{opt.label}</span>
                  {phase === 'submitting' && isSelected && (
                    <Loader2
                      className="size-4 animate-spin"
                      style={{ color }}
                    />
                  )}
                  {showResult &&
                    (outcome?.correct ? (
                      <Check className="size-4 text-emerald-500" />
                    ) : (
                      <X className="size-4 text-destructive" />
                    ))}
                </button>
              );
            })}
          </div>

          {phase === 'result' && outcome?.explanation && (
            <p className="text-xs text-muted-foreground text-center mt-1 leading-relaxed">
              {outcome.explanation}
            </p>
          )}
        </div>

        {phase === 'result' && (
          <DrawerFooter className="pt-2 mb-3">
            <Button
              onClick={handleClose}
              className="w-full font-bold text-white"
              style={{ backgroundColor: color, border: 'none' }}
            >
              Continue
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
