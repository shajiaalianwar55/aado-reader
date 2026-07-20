import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LibraryView } from '@/src/components/LibraryView';
import { pickPdfDocument } from '@/src/lib/pickPdf';

export default function LibraryScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const openPicker = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const doc = await pickPdfDocument();
      if (!doc) return;
      router.push({
        pathname: '/reader/[id]',
        params: { id: doc.id, uri: doc.uri, name: doc.name },
      });
    } catch (error) {
      Alert.alert('Could not open PDF', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }, [busy, router]);

  return <LibraryView onOpenDocument={openPicker} />;
}
