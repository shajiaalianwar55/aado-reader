import type { LibraryDocument, ReaderSettings } from '@/src/types';
import { defaultReadingTheme } from '@/src/theme/readingThemes';

export const STORAGE_KEYS = {
  library: '@aado/library',
  settings: '@aado/settings',
} as const;

export const defaultSettings: ReaderSettings = {
  theme: defaultReadingTheme,
  brightness: 1,
  fitMode: 'width',
  scrollMode: 'vertical',
  keepAwake: true,
};

export function createDocumentId(uri: string, name: string): string {
  const base = `${name}:${uri}`.replace(/[^a-zA-Z0-9._-]/g, '_');
  return base.slice(0, 180);
}

export function sortLibrary(docs: LibraryDocument[]): LibraryDocument[] {
  return [...docs].sort((a, b) => {
    const pinDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
    if (pinDiff !== 0) return pinDiff;
    return b.lastOpened - a.lastOpened;
  });
}

export function sortLibraryByMode<
  T extends {
    name: string;
    lastOpened: number;
    lastPage: number;
    pageCount: number;
    pinned?: boolean;
  },
>(docs: T[], mode: import('@/src/types').LibrarySortMode): T[] {
  return [...docs].sort((a, b) => {
    const pinDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
    if (pinDiff !== 0) return pinDiff;
    if (mode === 'name') {
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    }
    if (mode === 'progress') {
      const aPct = a.pageCount > 0 ? a.lastPage / a.pageCount : 0;
      const bPct = b.pageCount > 0 ? b.lastPage / b.pageCount : 0;
      return bPct - aPct;
    }
    return b.lastOpened - a.lastOpened;
  });
}
