import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { LibraryView } from '@/src/components/LibraryView';
import { RenameDocumentModal } from '@/src/components/RenameDocumentModal';
import { TrashModal } from '@/src/components/TrashModal';
import { pickPdfDocuments } from '@/src/lib/pickPdf';
import {
  emptyTrash, loadLibrary, loadTrash, permanentlyDeleteDocument,
  restoreDocument, trashDocument, updateDocument, upsertDocument,
} from '@/src/store/libraryStore';
import type { LibraryDocument, TrashedDocument } from '@/src/types';

export default function LibraryScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [trash, setTrash] = useState<TrashedDocument[]>([]);
  const [trashVisible, setTrashVisible] = useState(false);

  const refresh = useCallback(async () => {
    const [docs, removed] = await Promise.all([loadLibrary(), loadTrash()]);
    setDocuments(docs);
    setTrash(removed);
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
      const picked = await pickPdfDocuments();
      if (!picked.length) return;
      let next = documents;
      const imported: LibraryDocument[] = [];
      for (const doc of picked) {
        const existing = next.find((item) => item.id === doc.id);
        const merged = existing
          ? { ...existing, uri: doc.uri, lastOpened: Date.now() }
          : doc;
        next = await upsertDocument(merged);
        imported.push(merged);
      }
      setDocuments(next);
      if (imported.length === 1) {
        const [document] = imported;
        router.push({
          pathname: '/reader/[id]',
          params: { id: document.id, uri: document.uri, name: document.name },
        });
      } else {
        Alert.alert('PDFs added', `${imported.length} documents were added to your library.`);
      }
    } catch (error) {
      Alert.alert('Could not add PDFs', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }, [busy, documents, router]);

  const openDocument = useCallback(
    (id: string) => {
      const doc = documents.find((d) => d.id === id);
      if (!doc) return;

      const open = (startPage?: number) => {
        router.push({
          pathname: '/reader/[id]',
          params: {
            id: doc.id,
            uri: doc.uri,
            name: doc.name,
            ...(startPage != null ? { startPage: String(startPage) } : {}),
          },
        });
      };

      if (doc.lastPage > 1) {
        Alert.alert('Open document', `Resume at page ${doc.lastPage}, or start from the beginning?`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start over',
            onPress: async () => {
              await updateDocument(id, { lastPage: 1 });
              await refresh();
              open(1);
            },
          },
          { text: 'Resume', onPress: () => open() },
        ]);
        return;
      }

      open();
    },
    [documents, refresh, router],
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
            const next = await trashDocument(id);
            setDocuments(next);
            setTrash(await loadTrash());
          },
        },
      ],
    );
  }, [documents]);

  const renaming = documents.find((d) => d.id === renameId) ?? null;

  const onSaveRename = useCallback(
    async (name: string) => {
      if (!renameId) return;
      await updateDocument(renameId, { name });
      setRenameId(null);
      await refresh();
    },
    [refresh, renameId],
  );

  const onTogglePin = useCallback(
    async (id: string) => {
      const doc = documents.find((d) => d.id === id);
      if (!doc) return;
      await updateDocument(id, { pinned: !doc.pinned });
      await refresh();
    },
    [documents, refresh],
  );

  const onRestartDocument = useCallback(
    (id: string) => {
      const doc = documents.find((d) => d.id === id);
      Alert.alert(
        'Start from beginning?',
        doc
          ? `"${doc.name}" will open at page 1 next time.`
          : 'Reading progress will reset to page 1.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restart',
            onPress: async () => {
              await updateDocument(id, { lastPage: 1, finished: false });
              await refresh();
            },
          },
        ],
      );
    },
    [documents, refresh],
  );

  const onToggleFinished = useCallback(
    async (id: string) => {
      const doc = documents.find((d) => d.id === id);
      if (!doc) return;
      const finished = !doc.finished;
      await updateDocument(id, {
        finished,
        ...(finished && doc.pageCount > 0 ? { lastPage: doc.pageCount } : {}),
      });
      await refresh();
    },
    [documents, refresh],
  );

  return (
    <>
      <LibraryView
        documents={documents}
        onOpenDocument={openPicker}
        onSelectDocument={openDocument}
        onRemoveDocument={onRemoveDocument}
        onRenameDocument={setRenameId}
        onTogglePin={onTogglePin}
        onRestartDocument={onRestartDocument}
        onToggleFinished={onToggleFinished}
        trashCount={trash.length}
        onOpenTrash={() => setTrashVisible(true)}
      />
      <RenameDocumentModal
        visible={Boolean(renaming)}
        initialName={renaming?.name ?? ''}
        onCancel={() => setRenameId(null)}
        onSave={onSaveRename}
      />
      <TrashModal
        visible={trashVisible}
        documents={trash}
        onClose={() => setTrashVisible(false)}
        onRestore={async (id) => {
          await restoreDocument(id);
          await refresh();
        }}
        onDelete={async (id) => {
          await permanentlyDeleteDocument(id);
          await refresh();
        }}
        onEmpty={async () => {
          await emptyTrash();
          await refresh();
        }}
      />
    </>
  );
}
