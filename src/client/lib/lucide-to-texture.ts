import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import type { LucideIcon } from 'lucide-react';

export function lucideIconToDataUrl(
  Icon: LucideIcon,
  color: string = '#e8eaf0',
  size: number = 64,
  strokeWidth: number = 1.75
): string {
  const svgString = renderToStaticMarkup(
    React.createElement(Icon, { color, size, strokeWidth })
  );
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}
