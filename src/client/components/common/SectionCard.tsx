import type React from 'react';
import { cn } from '../../lib/utils';

type SectionCardProps = Readonly<{
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}>;

export function SectionCard({ title, children, className, style }: SectionCardProps) {
  return (
    <div
      className={cn('bg-card border border-border rounded-2xl p-4', className)}
      style={style}
    >
      {title && (
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
