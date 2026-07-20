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
  return [...docs].sort((a, b) => b.lastOpened - a.lastOpened);
}
