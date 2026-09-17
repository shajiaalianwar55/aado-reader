import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { defaultSettings, STORAGE_KEYS } from '@/src/store/constants';
import { loadLibrary, loadSettings, loadTrash, saveLibrary, saveSettings } from '@/src/store/libraryStore';
import { loadReadingStats } from '@/src/store/readingStats';
import type { LibraryDocument, ReaderSettings, ReadingStats, TrashedDocument } from '@/src/types';

const BACKUP_VERSION = 1;

export type AadoBackup = {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  library: LibraryDocument[];
  trash: TrashedDocument[];
  settings: ReaderSettings;
  readingStats: ReadingStats;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isDocument(value: unknown): value is LibraryDocument {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.uri === 'string' &&
    typeof value.lastOpened === 'number' &&
    typeof value.lastPage === 'number' &&
    typeof value.pageCount === 'number' &&
    Array.isArray(value.bookmarks)
  );
}

function isTrashedDocument(value: unknown): value is TrashedDocument {
  return isRecord(value) && typeof value.deletedAt === 'number' && isDocument(value);
}

function parseBackup(raw: string): AadoBackup {
  const value: unknown = JSON.parse(raw);
  if (
    !isRecord(value) ||
    value.version !== BACKUP_VERSION ||
    !Array.isArray(value.library) ||
    !value.library.every(isDocument) ||
    !Array.isArray(value.trash) ||
    !value.trash.every(isTrashedDocument) ||
    !isRecord(value.settings) ||
    !isRecord(value.readingStats) ||
    !Array.isArray(value.readingStats.days)
  ) {
    throw new Error('This is not a valid Aado backup file.');
  }
  return value as AadoBackup;
}

export async function createBackup(): Promise<AadoBackup> {
  const [library, trash, settings, readingStats] = await Promise.all([
    loadLibrary(),
    loadTrash(),
    loadSettings(),
    loadReadingStats(),
  ]);
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    library,
    trash,
    settings,
    readingStats,
  };
}

export async function shareBackup(): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('File sharing is not available on this device.');
  }
  const backup = await createBackup();
  const timestamp = backup.exportedAt.replace(/[:.]/g, '-');
  const file = new File(Paths.cache, `aado-backup-${timestamp}.json`);
  file.create();
  file.write(JSON.stringify(backup, null, 2));
  await Sharing.shareAsync(file.uri, {
    dialogTitle: 'Export Aado backup',
    mimeType: 'application/json',
    UTI: 'public.json',
  });
}

export async function pickBackup(): Promise<AadoBackup | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets.length) return null;
  const file = new File(result.assets[0].uri);
  return parseBackup(await file.text());
}

export async function restoreBackup(backup: AadoBackup): Promise<void> {
  await Promise.all([
    saveLibrary(backup.library),
    saveSettings({ ...defaultSettings, ...backup.settings }),
    AsyncStorage.setItem(STORAGE_KEYS.trash, JSON.stringify(backup.trash)),
    AsyncStorage.setItem(STORAGE_KEYS.readingStats, JSON.stringify(backup.readingStats)),
  ]);
}
