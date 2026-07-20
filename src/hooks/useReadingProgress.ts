import { useEffect, useRef } from 'react';
import { updateDocument } from '@/src/store/libraryStore';

export function useReadingProgress(documentId: string | undefined, page: number) {
  const lastSaved = useRef(page);

  useEffect(() => {
    if (!documentId || page < 1) return;
    if (lastSaved.current === page) return;

    const timer = setTimeout(() => {
      lastSaved.current = page;
      updateDocument(documentId, { lastPage: page, lastOpened: Date.now() }).catch(() => {
        // persistence failures should not interrupt reading
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [documentId, page]);
}
