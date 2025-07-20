import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import EventSource, { type EventSourceEvent } from 'react-native-sse';

const MAX_RETRY_COUNT = 3;

export interface UseSSEOptions {
  path: string;
  headers?: Record<string, string>;
  onMessage: (event: EventSourceEvent<'message'>) => void;
  pollingInterval?: number;
  enabled?: boolean;
}

const useSSE = ({
  path,
  headers,
  onMessage,
  pollingInterval = 5000,
  enabled = true,
}: UseSSEOptions) => {
  const esRef = useRef<EventSource | null>(null);
  const retryCtnRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let es: EventSource | null = null;

    const connect = () => {
      retryCtnRef.current = 0;
      es = new EventSource(`${process.env.EXPO_PUBLIC_API_URL}${path}`, {
        headers,
        pollingInterval,
        lineEndingCharacter: '\n', // Fix line ending warning
      });
      esRef.current = es;

      es.addEventListener('message', onMessage);
      es.addEventListener('open', () => {
        retryCtnRef.current = 0;
      });
      es.addEventListener('error', () => {
        retryCtnRef.current++;
      });
    };
    if (retryCtnRef.current < MAX_RETRY_COUNT) connect();

    // AppState management: auto close/reopen on background/foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        es?.open?.();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        es?.close();
      }
    };
    const appStateSub = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      appStateSub.remove();
      if (es) {
        es.removeAllEventListeners();
        es.close();
      }
    };
  }, [path, pollingInterval, headers, onMessage, enabled]);
};

export default useSSE;
