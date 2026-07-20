import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { buildPdfViewerHtml } from '@/src/lib/pdfViewerHtml';
import type { FitMode, ScrollMode } from '@/src/types';

export type PdfViewerHandle = {
  setPage: (page: number) => void;
  setFitMode: (mode: FitMode) => void;
  setScrollMode: (mode: ScrollMode) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  search: (query: string) => void;
  searchNext: () => void;
  searchPrev: () => void;
};

type PdfViewerProps = {
  uri: string;
  initialPage?: number;
  fitMode?: FitMode;
  scrollMode?: ScrollMode;
  onPageChange?: (page: number) => void;
  onLoad?: (pageCount: number) => void;
  onTap?: () => void;
  onSearchResult?: (count: number, index: number) => void;
  onError?: (message: string) => void;
};

export const PdfViewer = forwardRef<PdfViewerHandle, PdfViewerProps>(function PdfViewer(
  {
    uri,
    initialPage = 1,
    fitMode = 'width',
    scrollMode = 'vertical',
    onPageChange,
    onLoad,
    onTap,
    onSearchResult,
    onError,
  },
  ref,
) {
  const webRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const html = useRef(buildPdfViewerHtml()).current;
  const pending = useRef({ initialPage, fitMode, scrollMode });

  useEffect(() => {
    pending.current = { initialPage, fitMode, scrollMode };
  }, [initialPage, fitMode, scrollMode]);

  const send = useCallback((payload: Record<string, unknown>) => {
    webRef.current?.postMessage(JSON.stringify(payload));
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setPage: (page) => send({ type: 'setPage', page }),
      setFitMode: (mode) => send({ type: 'setFit', fitMode: mode }),
      setScrollMode: (mode) => send({ type: 'setScrollMode', scrollMode: mode }),
      zoomIn: () => send({ type: 'zoomIn' }),
      zoomOut: () => send({ type: 'zoomOut' }),
      search: (query) => send({ type: 'search', query }),
      searchNext: () => send({ type: 'searchNext' }),
      searchPrev: () => send({ type: 'searchPrev' }),
    }),
    [send],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadFile() {
      try {
        setLoading(true);
        setError(null);
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (cancelled) return;
        if (!ready) {
          (pending as { current: typeof pending.current & { data?: string } }).current = {
            ...pending.current,
            data: base64,
          } as typeof pending.current & { data?: string };
          return;
        }
        send({
          type: 'load',
          data: base64,
          page: pending.current.initialPage,
          fitMode: pending.current.fitMode,
          scrollMode: pending.current.scrollMode,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to read PDF';
        if (!cancelled) {
          setError(message);
          onError?.(message);
          setLoading(false);
        }
      }
    }
    loadFile();
    return () => {
      cancelled = true;
    };
  }, [uri, ready, send, onError]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data) as {
          type: string;
          page?: number;
          pageCount?: number;
          count?: number;
          index?: number;
        };
        switch (msg.type) {
          case 'ready':
            setReady(true);
            break;
          case 'loaded':
            setLoading(false);
            if (msg.pageCount) onLoad?.(msg.pageCount);
            break;
          case 'page':
          case 'rendered':
            if (msg.page) onPageChange?.(msg.page);
            if (msg.pageCount) onLoad?.(msg.pageCount);
            setLoading(false);
            break;
          case 'tap':
            onTap?.();
            break;
          case 'search':
            onSearchResult?.(msg.count ?? 0, msg.index ?? -1);
            break;
          default:
            break;
        }
      } catch {
        // ignore malformed messages
      }
    },
    [onLoad, onPageChange, onSearchResult, onTap],
  );

  useEffect(() => {
    if (!ready) return;
    send({ type: 'setFit', fitMode });
  }, [fitMode, ready, send]);

  useEffect(() => {
    if (!ready) return;
    send({ type: 'setScrollMode', scrollMode });
  }, [scrollMode, ready, send]);

  // When WebView becomes ready, push any buffered base64 load
  useEffect(() => {
    if (!ready) return;
    const buffered = (pending.current as { data?: string }).data;
    if (!buffered) return;
    send({
      type: 'load',
      data: buffered,
      page: pending.current.initialPage,
      fitMode: pending.current.fitMode,
      scrollMode: pending.current.scrollMode,
    });
    delete (pending.current as { data?: string }).data;
  }, [ready, send]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={onMessage}
        allowFileAccess
        allowUniversalAccessFromFileURLs
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        style={styles.webview}
        setSupportMultipleWindows={false}
      />
      {loading && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator color="#C4A574" size="large" />
        </View>
      )}
      {error && (
        <View style={styles.overlay}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  webview: { flex: 1, backgroundColor: 'transparent' },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,20,25,0.35)',
    padding: 24,
  },
  error: { color: '#F4F1EA', textAlign: 'center', fontSize: 15 },
});
