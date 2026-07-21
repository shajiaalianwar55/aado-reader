import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { LibraryView } from '@/src/components/LibraryView';
import { pickPdfDocument } from '@/src/lib/pickPdf';
import { loadLibrary, removeDocument, upsertDocument } from '@/src/store/libraryStore';
import type { LibraryDocument } from '@/src/types';

export default function LibraryScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);

  const refresh = useCallback(async () => {
    const docs = await loadLibrary();
    setDocuments(docs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openPicker = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const doc = await pickPdfDocument();
      if (!doc) return;
      const existing = documents.find((d) => d.id === doc.id);
      const merged = existing
        ? { ...existing, uri: doc.uri, lastOpened: Date.now() }
        : doc;
      const next = await upsertDocument(merged);
      setDocuments(next);
      router.push({
        pathname: '/reader/[id]',
        params: { id: merged.id, uri: merged.uri, name: merged.name },
      });
    } catch (error) {
      Alert.alert('Could not open PDF', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }, [busy, documents, router]);

  const openDocument = useCallback(
    (id: string) => {
      const doc = documents.find((d) => d.id === id);
      if (!doc) return;
      router.push({
        pathname: '/reader/[id]',
        params: { id: doc.id, uri: doc.uri, name: doc.name },
      });
    },
    [documents, router],
  );

  const onRemoveDocument = useCallback((id: string) => {
    const doc = documents.find((d) => d.id === id);
    Alert.alert(
      'Remove from library?',
      doc ? `"${doc.name}" will be removed from recent files.` : 'This document will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const next = await removeDocument(id);
            setDocuments(next);
          },
        },
      ],
    );
  }, [documents]);

  return (
    <LibraryView
      documents={documents}
      onOpenDocument={openPicker}
      onSelectDocument={openDocument}
      onRemoveDocument={onRemoveDocument}
    />
  );
}
