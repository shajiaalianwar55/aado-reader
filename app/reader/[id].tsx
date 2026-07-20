import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PdfViewer, type PdfViewerHandle } from '@/src/components/PdfViewer';
import { getDocument, updateDocument, upsertDocument } from '@/src/store/libraryStore';
import type { LibraryDocument } from '@/src/types';

export default function ReaderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; uri?: string; name?: string }>();
  const viewerRef = useRef<PdfViewerHandle>(null);
  const [doc, setDoc] = useState<LibraryDocument | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => params.name ?? doc?.name ?? 'Document', [params.name, doc?.name]);
  const uri = params.uri ?? doc?.uri;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = await getDocument(params.id);
      if (cancelled) return;
      if (existing) {
        setDoc(existing);
        setPage(existing.lastPage || 1);
        setPageCount(existing.pageCount || 0);
        return;
      }
      if (params.uri && params.name) {
        const created: LibraryDocument = {
          id: params.id,
          name: params.name,
          uri: params.uri,
          lastOpened: Date.now(),
          lastPage: 1,
          pageCount: 0,
          bookmarks: [],
        };
        await upsertDocument(created);
        if (!cancelled) setDoc(created);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id, params.uri, params.name]);

  const onLoad = useCallback(
    async (count: number) => {
      setPageCount(count);
      if (params.id) {
        await updateDocument(params.id, { pageCount: count, lastOpened: Date.now() });
      }
    },
    [params.id],
  );

  const onPageChange = useCallback((next: number) => {
    setPage(next);
  }, []);

  if (!uri) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.error}>Missing PDF file.</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.pageLabel}>
          {page}
          {pageCount ? ` / ${pageCount}` : ''}
        </Text>
      </View>
      <PdfViewer
        ref={viewerRef}
        uri={uri}
        initialPage={page}
        onLoad={onLoad}
        onPageChange={onPageChange}
        onError={setError}
      />
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2630',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backText: {
    color: '#C4A574',
    fontWeight: '600',
    fontSize: 16,
  },
  title: {
    flex: 1,
    color: '#F4F1EA',
    fontSize: 15,
    fontWeight: '600',
  },
  pageLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    minWidth: 56,
    textAlign: 'right',
  },
  error: {
    color: '#F4F1EA',
    textAlign: 'center',
  },
  errorBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: '#3B1F1F',
    padding: 12,
    borderRadius: 10,
  },
});
