import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LibraryDocument, ReaderSettings } from '@/src/types';
import {
  STORAGE_KEYS,
  defaultSettings,
  sortLibrary,
} from '@/src/store/constants';

export async function loadLibrary(): Promise<LibraryDocument[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.library);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as LibraryDocument[];
    return sortLibrary(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

export async function saveLibrary(docs: LibraryDocument[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.library, JSON.stringify(sortLibrary(docs)));
}

export async function upsertDocument(doc: LibraryDocument): Promise<LibraryDocument[]> {
  const current = await loadLibrary();
  const next = current.filter((item) => item.id !== doc.id);
  next.unshift(doc);
  await saveLibrary(next);
  return next;
}

export async function getDocument(id: string): Promise<LibraryDocument | null> {
  const docs = await loadLibrary();
  return docs.find((d) => d.id === id) ?? null;
}

export async function updateDocument(
  id: string,
  patch: Partial<LibraryDocument>,
): Promise<LibraryDocument | null> {
  const docs = await loadLibrary();
  const index = docs.findIndex((d) => d.id === id);
  if (index < 0) return null;
  const updated = { ...docs[index], ...patch };
  docs[index] = updated;
  await saveLibrary(docs);
  return updated;
}

export async function removeDocument(id: string): Promise<LibraryDocument[]> {
  const docs = await loadLibrary();
  const next = docs.filter((d) => d.id !== id);
  await saveLibrary(next);
  return next;
}

export async function clearLibrary(): Promise<void> {
  await saveLibrary([]);
}

export async function loadSettings(): Promise<ReaderSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.settings);
  if (!raw) return defaultSettings;
  try {
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<ReaderSettings>) };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: ReaderSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}
