import * as DocumentPicker from 'expo-document-picker';
import type { LibraryDocument } from '@/src/types';
import { createDocumentId } from '@/src/store/constants';

export async function pickPdfDocuments(): Promise<LibraryDocument[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
    multiple: true,
  });

  if (result.canceled || !result.assets?.length) {
    return [];
  }

  const pickedAt = Date.now();
  return result.assets.map((asset, index) => {
    const name = asset.name?.toLowerCase().endsWith('.pdf')
      ? asset.name
      : `${asset.name || 'Document'}.pdf`;
    const uri = asset.uri;
    return {
      id: createDocumentId(uri, name),
      name,
      uri,
      lastOpened: pickedAt - index,
      lastPage: 1,
      pageCount: 0,
      bookmarks: [],
      pinned: false,
    };
  });
}
