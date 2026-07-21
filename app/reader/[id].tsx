import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { BookmarkBar } from '@/src/components/BookmarkBar';
import { PageScrubber } from '@/src/components/PageScrubber';
import { PdfViewer, type PdfViewerHandle } from '@/src/components/PdfViewer';
import { ReaderChrome } from '@/src/components/ReaderChrome';
import { ReaderControls } from '@/src/components/ReaderControls';
import { SearchBar } from '@/src/components/SearchBar';
import { ThemeControls } from '@/src/components/ThemeControls';
import { useReadingProgress } from '@/src/hooks/useReadingProgress';
import { useReadingSession } from '@/src/hooks/useReadingSession';
import { getDocument, loadSettings, saveSettings, updateDocument, upsertDocument } from '@/src/store/libraryStore';
import { readingThemes } from '@/src/theme/readingThemes';
import type { FitMode, LibraryDocument, ReadingThemeId, ScrollMode } from '@/src/types';

export default function ReaderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; uri?: string; name?: string }>();
  const viewerRef = useRef<PdfViewerHandle>(null);
  const [doc, setDoc] = useState<LibraryDocument | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scrollMode, setScrollMode] = useState<ScrollMode>('vertical');
  const [fitMode, setFitMode] = useState<FitMode>('width');
  const [chromeVisible, setChromeVisible] = useState(true);
  const [themeId, setThemeId] = useState<ReadingThemeId>('night');
  const [brightness, setBrightness] = useState(1);
  const [keepAwake, setKeepAwake] = useState(true);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [matchIndex, setMatchIndex] = useState(-1);
  const [restored, setRestored] = useState(false);

  const theme = readingThemes[themeId];
  const title = useMemo(() => params.name ?? doc?.name ?? 'Document', [params.name, doc?.name]);
  const uri = params.uri ?? doc?.uri;

  useReadingSession(Boolean(uri) && keepAwake);
  useReadingProgress(params.id, page);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const settings = await loadSettings();
      if (!cancelled) {
        setThemeId(settings.theme);
        setBrightness(settings.brightness);
        setFitMode(settings.fitMode);
        setScrollMode(settings.scrollMode);
        setKeepAwake(settings.keepAwake);
      }
      const existing = await getDocument(params.id);
      if (cancelled) return;
      if (existing) {
        setDoc(existing);
        setPage(existing.lastPage || 1);
        setPageCount(existing.pageCount || 0);
        setBookmarks(existing.bookmarks ?? []);
        setRestored(true);
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
        if (!cancelled) {
          setDoc(created);
          setRestored(true);
        }
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
    setPage((prev) => {
      if (prev !== next) {
        Haptics.selectionAsync().catch(() => undefined);
      }
      return next;
    });
  }, []);

  const goPage = useCallback(
    (next: number) => {
      if (pageCount <= 0) return;
      const clamped = Math.min(Math.max(next, 1), pageCount);
      setPage(clamped);
      viewerRef.current?.setPage(clamped);
      Haptics.selectionAsync().catch(() => undefined);
    },
    [pageCount],
  );

  const toggleScrollMode = useCallback(() => {
    setScrollMode((mode) => {
      const next = mode === 'vertical' ? 'paged' : 'vertical';
      viewerRef.current?.setScrollMode(next);
      return next;
    });
  }, []);

  const toggleFitMode = useCallback(() => {
    setFitMode((mode) => {
      const next = mode === 'width' ? 'page' : 'width';
      viewerRef.current?.setFitMode(next);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback(async () => {
    const next = bookmarks.includes(page)
      ? bookmarks.filter((b) => b !== page)
      : [...bookmarks, page].sort((a, b) => a - b);
    setBookmarks(next);
    if (params.id) {
      await updateDocument(params.id, { bookmarks: next });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, [bookmarks, page, params.id]);

  const onThemeChange = useCallback((next: ReadingThemeId) => {
    setThemeId(next);
    loadSettings().then((current) => saveSettings({ ...current, theme: next })).catch(() => undefined);
  }, []);

  const onBrightnessChange = useCallback((next: number) => {
    setBrightness(next);
    loadSettings()
      .then((current) => saveSettings({ ...current, brightness: next }))
      .catch(() => undefined);
  }, []);

  const onShare = useCallback(async () => {
    if (!uri) return;
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing unavailable', 'Sharing is not supported on this device.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: title,
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      Alert.alert('Could not share', error instanceof Error ? error.message : 'Unknown error');
    }
  }, [title, uri]);

  if (!uri || !restored) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.error, { color: theme.text }]}>
          {!uri ? 'Missing PDF file.' : 'Restoring your place…'}
        </Text>
        {!uri ? (
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: theme.accent }]}>Back</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <>
      <StatusBar style={themeId === 'night' ? 'light' : 'dark'} />
      <ReaderChrome
      visible={chromeVisible}
      theme={theme}
      title={title}
      onBack={() => router.back()}
      topInset={insets.top}
      bottomInset={insets.bottom}
      topExtra={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share PDF"
          onPress={onShare}
          hitSlop={8}
          style={styles.shareBtn}>
          <Text style={[styles.shareText, { color: theme.accent }]}>Share</Text>
        </Pressable>
      }
      bottom={
        <>
          <ReaderControls
            page={page}
            pageCount={pageCount}
            scrollMode={scrollMode}
            fitMode={fitMode}
            onPrev={() => goPage(page - 1)}
            onNext={() => goPage(page + 1)}
            onToggleScrollMode={toggleScrollMode}
            onToggleFitMode={toggleFitMode}
            onZoomIn={() => viewerRef.current?.zoomIn()}
            onZoomOut={() => viewerRef.current?.zoomOut()}
          />
          <SearchBar
            theme={theme}
            matchCount={matchCount}
            matchIndex={matchIndex}
            onSearch={(query) => viewerRef.current?.search(query)}
            onNext={() => viewerRef.current?.searchNext()}
            onPrev={() => viewerRef.current?.searchPrev()}
          />
          <BookmarkBar
            theme={theme}
            page={page}
            bookmarks={bookmarks}
            onToggle={toggleBookmark}
            onJump={goPage}
          />
          <PageScrubber theme={theme} page={page} pageCount={pageCount} onSelect={goPage} />
          <ThemeControls
            theme={theme}
            activeTheme={themeId}
            brightness={brightness}
            onThemeChange={onThemeChange}
            onBrightnessChange={onBrightnessChange}
          />
        </>
      }>
      <View style={styles.viewerWrap}>
        <PdfViewer
          ref={viewerRef}
          uri={uri}
          initialPage={page}
          fitMode={fitMode}
          scrollMode={scrollMode}
          onLoad={onLoad}
          onPageChange={onPageChange}
          onTap={() => setChromeVisible((v) => !v)}
          onSearchResult={(count, index) => {
            setMatchCount(count);
            setMatchIndex(index);
          }}
          onError={setError}
        />
        <View
          pointerEvents="none"
          style={[
            styles.tint,
            {
              backgroundColor: '#000',
              opacity: Math.max(0, 1 - brightness) * 0.55,
            },
          ]}
        />
        <View pointerEvents="none" style={[styles.tint, { backgroundColor: theme.pdfTint }]} />
      </View>
      {error ? (
        <View style={styles.errorBanner} accessibilityLiveRegion="polite">
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
    </ReaderChrome>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  viewerWrap: { flex: 1 },
  tint: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backText: {
    fontWeight: '600',
    fontSize: 16,
  },
  shareBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  shareText: {
    fontWeight: '700',
    fontSize: 15,
  },
  error: {
    textAlign: 'center',
    color: '#F4F1EA',
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
