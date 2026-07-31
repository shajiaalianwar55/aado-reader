import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LibraryDocument, ReaderSettings, TrashedDocument } from '@/src/types';
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

export async function loadTrash(): Promise<TrashedDocument[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.trash);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as TrashedDocument[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.deletedAt - a.deletedAt) : [];
  } catch {
    return [];
  }
}

async function saveTrash(documents: TrashedDocument[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.trash, JSON.stringify(documents));
}

export async function trashDocument(id: string): Promise<LibraryDocument[]> {
  const docs = await loadLibrary();
  const document = docs.find((item) => item.id === id);
  if (!document) return docs;
  const trash = await loadTrash();
  await saveTrash([
    { ...document, deletedAt: Date.now() },
    ...trash.filter((item) => item.id !== id),
  ]);
  const next = docs.filter((item) => item.id !== id);
  await saveLibrary(next);
  return next;
}

export async function restoreDocument(id: string): Promise<void> {
  const trash = await loadTrash();
  const document = trash.find((item) => item.id === id);
  if (!document) return;
  const { deletedAt: _deletedAt, ...restored } = document;
  await upsertDocument({ ...restored, lastOpened: Date.now() });
  await saveTrash(trash.filter((item) => item.id !== id));
}

export async function permanentlyDeleteDocument(id: string): Promise<void> {
  const trash = await loadTrash();
  await saveTrash(trash.filter((item) => item.id !== id));
}

export async function emptyTrash(): Promise<void> {
  await saveTrash([]);
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
