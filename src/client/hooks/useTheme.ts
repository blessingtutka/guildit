import { useEffect } from 'react';

/**
 * Syncs the `dark` class on <html> with the OS / Reddit color scheme.
 * Reddit's webview inherits the device theme via prefers-color-scheme.
 * Call this once at the app root so all Tailwind dark: variants work.
 */
export function useTheme() {
  useEffect(() => {
    const root = document.documentElement;

    const apply = (dark: boolean) => {
      if (dark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mq.matches);

    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
}
