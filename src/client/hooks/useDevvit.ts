import { useEffect, useCallback } from 'react';
import type {
  DevvitToWebviewMessage,
  WebviewToDevvitMessage,
} from '../../shared/api';

const TO_HOST_PREFIX = '__GUILDIT_WEBVIEW__';
const FROM_HOST_PREFIX = '__GUILDIT_HOST__';

// Send TO Devvit server (webview → host)
export function sendToDevvit(msg: WebviewToDevvitMessage) {
  const payload = TO_HOST_PREFIX + JSON.stringify(msg);

  window.parent.postMessage(payload, '*');
}

// Safe type guard
function isObjectMessage(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null;
}

export function useDevvit(onMessage: (msg: DevvitToWebviewMessage) => void) {
  const stableHandler = useCallback(
    (e: MessageEvent) => {
      const d = e.data;
      if (!d) return;

      // 1. STRING MESSAGES (host → webview)
      if (typeof d === 'string') {
        if (d.startsWith(FROM_HOST_PREFIX)) {
          try {
            const parsed = JSON.parse(d.slice(FROM_HOST_PREFIX.length));
            console.log('⬅️ Devvit message (string):', parsed);
            onMessage(parsed as DevvitToWebviewMessage);
          } catch (err) {
            console.warn('Failed to parse Devvit message:', err);
          }
        }
        return;
      }

      // 2. OBJECT MESSAGES (host → webview)
      if (isObjectMessage(d)) {
        if ('__guildit_host' in d && 'message' in d) {
          console.log('⬅️ Devvit message (wrapped):', d.message);
          onMessage(d.message as DevvitToWebviewMessage);
          return;
        }

        if ('type' in d) {
          console.log('⬅️ Devvit message (object):', d);
          onMessage(d as DevvitToWebviewMessage);
          return;
        }
      }
    },
    [onMessage]
  );

  useEffect(() => {
    window.addEventListener('message', stableHandler);

    // notify host webview is ready
    sendToDevvit({ type: 'READY' });

    return () => window.removeEventListener('message', stableHandler);
  }, [stableHandler]);
}
