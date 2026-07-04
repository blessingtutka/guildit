import { useEffect, useCallback } from 'react';
import type {
  DevvitToWebviewMessage,
  WebviewToDevvitMessage,
} from '../../shared/api';

// Send TO Devvit server
export function sendToDevvit(msg: WebviewToDevvitMessage) {
  console.log('➡️ Sending to Devvit:', msg);
  window.parent.postMessage(msg, '*');
}

// Listen for messages FROM Devvit server
export function useDevvit(onMessage: (msg: DevvitToWebviewMessage) => void) {
  const stableHandler = useCallback(
    (e: MessageEvent) => {
      if (e.data && typeof e.data === 'object' && 'type' in e.data) {
        console.log('⬅️ Received Devvit message:', e.data);
        onMessage(e.data as DevvitToWebviewMessage);
      }
    },
    [onMessage]
  );

  useEffect(() => {
    window.addEventListener('message', stableHandler);

    console.log('➡️ Sending READY to Devvit');
    sendToDevvit({ type: 'READY' });

    return () => window.removeEventListener('message', stableHandler);
  }, [stableHandler]);
}
