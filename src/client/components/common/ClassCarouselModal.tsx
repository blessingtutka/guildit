// ClassCarouselModal.tsx - Modal with full class details (with safety checks)
import React, { useState, useEffect } from 'react';
import type { PlayerClass } from '../../../shared/api';
import type { ClassMeta } from '../../../shared/web';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ClassIcon } from './ClassIcon';

interface ClassCarouselModalProps {
  classes: ClassMeta[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cls: PlayerClass) => void;
}

export function ClassCarouselModal({
  classes,
  initialIndex,
  isOpen,
  onClose,
  onSelect,
}: ClassCarouselModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Ensure currentIndex is within bounds
  const safeIndex = Math.max(0, Math.min(currentIndex, classes.length - 1));

  useEffect(() => {
    // Validate initialIndex is within bounds
    const validIndex = Math.max(0, Math.min(initialIndex, classes.length - 1));
    setCurrentIndex(validIndex);
  }, [initialIndex, classes.length]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || classes.length === 0) return null;

  const currentClass = classes[safeIndex];

  // If currentClass is undefined, return null or a fallback
  if (!currentClass) return null;

  const totalClasses = classes.length;

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev === 0 ? totalClasses - 1 : prev - 1;
      return Math.max(0, Math.min(newIndex, totalClasses - 1));
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev === totalClasses - 1 ? 0 : prev + 1;
      return Math.max(0, Math.min(newIndex, totalClasses - 1));
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  const classKey = currentClass.key.toLowerCase();
  const style = {
    border: `border-${classKey}`,
    bg: `bg-${classKey}/10`,
    text: `text-${classKey}`,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="relative max-w-2xl w-full max-h-[90vh] bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors duration-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation arrows - only show if more than one class */}
        {totalClasses > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all duration-200 hover:scale-110"
              aria-label="Previous class"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all duration-200 hover:scale-110"
              aria-label="Next class"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[90vh] p-6">
          <div className="flex flex-col items-center gap-6">
            {/* Animated Icon/Image */}
            <div
              className="
                relative w-32 h-32 rounded-full flex items-center justify-center
                transition-all duration-500 animate-in slide-in-from-top-4
              "
              style={{
                background: `radial-gradient(circle, var(--color-${classKey})20, transparent 70%)`,
              }}
            >
              <div
                className={`
                absolute inset-0 rounded-full animate-pulse
                ${style.border} border-2
              `}
              />
              {currentClass.image ? (
                <img
                  src={`/images/${currentClass.image}`}
                  alt={currentClass.name}
                  className="w-24 h-24 object-contain relative z-10 animate-bounce-subtle"
                />
              ) : (
                <ClassIcon classMeta={currentClass} />
              )}
            </div>

            {/* Name and Tagline */}
            <div className="text-center">
              <h2 className={`text-3xl font-bold mb-2 ${style.text}`}>
                {currentClass.name}
              </h2>
              <p className="text-lg italic text-zinc-400">
                {currentClass.tagline}
              </p>
            </div>

            <div className={`h-px w-24 ${style.bg}`} />

            {/* Description */}
            <div className="prose prose-invert max-w-none text-center">
              <p className="text-zinc-300 leading-relaxed">
                {currentClass.description}
              </p>
            </div>

            {/* Select Button */}
            <button
              onClick={() => onSelect(currentClass.key)}
              className={`
                w-full max-w-sm px-6 py-3 mb-3 rounded-lg font-semibold text-white
                transition-all duration-300 hover:scale-105 hover:shadow-lg
                ${style.bg} ${style.border} border-2
                hover:bg-opacity-20
              `}
            >
              Choose {currentClass.name}
            </button>
          </div>
        </div>

        {/* Pagination dots - only show if more than one class */}
        {totalClasses > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {classes.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const validIndex = Math.max(
                    0,
                    Math.min(index, totalClasses - 1)
                  );
                  setCurrentIndex(validIndex);
                }}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === safeIndex ? 'w-6 bg-white' : 'bg-zinc-600 hover:bg-zinc-500'}
                `}
                aria-label={`Go to class ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
