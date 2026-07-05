import { useState } from 'react';
import type { PlayerClass } from '../../../shared/api';
import type { ClassMeta } from '../../../shared/web';

interface ClassCardProps {
  meta: ClassMeta;
  onSelect: (cls: PlayerClass) => void;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
}
const CLASS_STYLES = {
  RANGER: {
    border: 'border-ranger',
    bg: 'bg-ranger/8',
    text: 'text-ranger',
    glow: 'shadow-[0_0_35px_rgba(61,125,89,.35)]',
  },
  MENDER: {
    border: 'border-mender',
    bg: 'bg-mender/8',
    text: 'text-mender',
    glow: 'shadow-[0_0_35px_rgba(111,174,132,.35)]',
  },
  WARDER: {
    border: 'border-warder',
    bg: 'bg-warder/8',
    text: 'text-warder',
    glow: 'shadow-[0_0_35px_rgba(93,132,181,.35)]',
  },
  WEAVER: {
    border: 'border-weaver',
    bg: 'bg-weaver/8',
    text: 'text-weaver',
    glow: 'shadow-[0_0_40px_rgba(157,97,210,.40)]',
  },
} as const;

export function ClassCard({
  meta,
  onSelect,
  disabled = false,
  selected = false,
  onClick,
}: ClassCardProps) {
  const [hovered, setHovered] = useState(false);

  const style = CLASS_STYLES[meta.key];
  const Icon = meta.icon;

  const active = hovered || selected;

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else {
      onSelect(meta.key);
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
          group
          relative
          overflow-hidden

          flex
          flex-col
          items-center
          gap-3

          rounded-2xl
          border
          p-5

          transition-all
          duration-300

          cursor-pointer

          bg-card
          text-card-foreground

          focus:outline-none

      ${
        active
          ? `
            ${style.border}
            ${style.bg}
            ${style.glow}
            shadow-xl
            -translate-y-1
            scale-[1.02]
          `
          : `
            border-border
            hover:${style.border}
            hover:${style.bg}
            hover:${style.glow}
            hover:-translate-y-1
          `
      }

      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      {/* Animated background glow */}
      <div
        className={`
            absolute
            inset-0
            rounded-2xl
            pointer-events-none
            transition-all
            duration-500

            ${style.bg}

            ${
              active
                ? 'opacity-100 blur-2xl scale-110'
                : 'opacity-0 group-hover:opacity-60 group-hover:blur-xl group-hover:scale-105'
            }
        `}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {meta.image ? (
          <img
            src={`/images/${meta.image}`}
            alt={meta.name}
            className={`
              h-16 w-16 object-contain 
              transition-all duration-300 
              group-hover:scale-110 group-hover:rotate-6
              ${active ? 'scale-110 rotate-6' : ''}
            `}
          />
        ) : (
          <span
            className={`
                transition-all duration-300
                group-hover:scale-110 group-hover:rotate-6
                ${active ? 'scale-110 rotate-6' : ''}
              `}
          >
            <Icon className="h-10 w-10" />
          </span>
        )}

        <h3
          className={`
              font-heading
              text-lg
              tracking-wide
              font-bold
              transition-colors

          ${active ? style.text : 'text-foreground'}
          `}
        >
          {meta.name}
        </h3>

        <p className="text-xs italic text-muted-foreground text-center">
          {meta.tagline}
        </p>

        {/* Selection indicator */}
        {selected && (
          <div
            className={`
                absolute
                top-3
                right-3

                w-3
                h-3
                rounded-full

                ${style.bg}
                ${style.border}

                shadow-lg
                animate-pulse
          `}
          />
        )}
      </div>
    </button>
  );
}
