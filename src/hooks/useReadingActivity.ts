import { useEffect, useRef } from 'react';
import { recordReadingSession } from '@/src/store/readingStats';

export function useReadingActivity(documentId: string, page: number, enabled: boolean) {
  const latestPage = useRef(page);

  useEffect(() => {
    latestPage.current = page;
  }, [page]);

  useEffect(() => {
    if (!enabled || !documentId) return;
    const startedAt = Date.now();
    const startedPage = latestPage.current;
    return () => {
      const seconds = (Date.now() - startedAt) / 1000;
      const pages = Math.abs(latestPage.current - startedPage);
      recordReadingSession(documentId, seconds, pages).catch(() => undefined);
    };
  }, [documentId, enabled]);
}
