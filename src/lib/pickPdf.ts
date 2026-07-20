import * as DocumentPicker from 'expo-document-picker';
import type { LibraryDocument } from '@/src/types';
import { createDocumentId } from '@/src/store/constants';

export async function pickPdfDocument(): Promise<LibraryDocument | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];
  const name = asset.name?.endsWith('.pdf') ? asset.name : `${asset.name || 'Document'}.pdf`;
  const uri = asset.uri;
  const id = createDocumentId(uri, name);

  return {
    id,
    name,
    uri,
    lastOpened: Date.now(),
    lastPage: 1,
    pageCount: 0,
    bookmarks: [],
  };
}
