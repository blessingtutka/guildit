import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import type { LucideIcon } from 'lucide-react';

function base64EncodeUnicode(str: string): string {
  // UTF-8 safe browser encoding
  const bytes = new TextEncoder().encode(str);
  let binary = '';

  bytes.forEach((b) => (binary += String.fromCodePoint(b)));

  return btoa(binary);
}

function ensureSvgNamespace(svg: string): string {
  return svg.includes('xmlns')
    ? svg
    : svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
}

export function lucideIconToDataUrl(
  Icon: LucideIcon,
  color: string = '#e8eaf0',
  size: number = 64,
  strokeWidth: number = 1.75
): string {
  let svg = renderToStaticMarkup(
    React.createElement(Icon, { color, size, strokeWidth })
  );

  svg = ensureSvgNamespace(svg);

  // safer for data URI embedding
  svg = svg.replaceAll('"', "'");

  const base64 = base64EncodeUnicode(svg);

  return `data:image/svg+xml;base64,${base64}`;
}
