import type { LibraryDocument, ReaderSettings } from '@/src/types';
import { defaultReadingTheme } from '@/src/theme/readingThemes';
import { estimateRemainingReadingSeconds } from '@/src/lib/readingEstimate';

export const STORAGE_KEYS = {
  library: '@aado/library',
  settings: '@aado/settings',
  readingStats: '@aado/reading-stats',
  trash: '@aado/trash',
} as const;

export const defaultSettings: ReaderSettings = {
  theme: defaultReadingTheme,
  brightness: 1,
  fitMode: 'width',
  scrollMode: 'vertical',
  keepAwake: true,
  haptics: true,
  autoHideMs: 4000,
  dailyGoalMinutes: 20,
  focusSessionMinutes: 25,
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
    readingSeconds?: number;
    rating?: number;
    finished?: boolean;
    pinned?: boolean;
    queuedAt?: number;
    targetDate?: number;
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
    if (mode === 'readingTime') {
      return (b.readingSeconds ?? 0) - (a.readingSeconds ?? 0);
    }
    if (mode === 'rating') {
      return (b.rating ?? 0) - (a.rating ?? 0) || b.lastOpened - a.lastOpened;
    }
    if (mode === 'queue') {
      if (a.queuedAt == null && b.queuedAt == null) return b.lastOpened - a.lastOpened;
      if (a.queuedAt == null) return 1;
      if (b.queuedAt == null) return -1;
      return a.queuedAt - b.queuedAt;
    }
    if (mode === 'dueDate') {
      if (a.targetDate == null && b.targetDate == null) return b.lastOpened - a.lastOpened;
      if (a.targetDate == null) return 1;
      if (b.targetDate == null) return -1;
      return a.targetDate - b.targetDate;
    }
    if (mode === 'timeLeft') {
      const aRemaining = estimateRemainingReadingSeconds(a);
      const bRemaining = estimateRemainingReadingSeconds(b);
      if (aRemaining == null && bRemaining == null) return b.lastOpened - a.lastOpened;
      if (aRemaining == null) return 1;
      if (bRemaining == null) return -1;
      return aRemaining - bRemaining;
    }
    return b.lastOpened - a.lastOpened;
  });
}
