import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { getDocument, updateDocument } from '@/src/store/libraryStore';

const SAVE_INTERVAL_MS = 30_000;

export function useReadingTime(documentId: string | undefined, active: boolean) {
  const accumulated = useRef(0);

  useEffect(() => {
    if (!documentId || !active) return;

    let lastTick = Date.now();
    let foreground = AppState.currentState === 'active';
    const recordElapsed = async () => {
      const now = Date.now();
      if (foreground) {
        accumulated.current += Math.max(0, Math.floor((now - lastTick) / 1000));
      }
      lastTick = now;
      if (accumulated.current < 1) return;
      const elapsed = accumulated.current;
      accumulated.current = 0;
      const document = await getDocument(documentId);
      if (document) {
        await updateDocument(documentId, {
          readingSeconds: (document.readingSeconds ?? 0) + elapsed,
        });
      }
    };

    const timer = setInterval(() => void recordElapsed(), SAVE_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', (nextState) => {
      void recordElapsed();
      foreground = nextState === 'active';
      lastTick = Date.now();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
      void recordElapsed();
    };
  }, [active, documentId]);
}
