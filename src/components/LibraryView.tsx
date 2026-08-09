import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatReadingProgress } from '@/src/lib/readingProgress';
import { sortLibraryByMode } from '@/src/store/constants';
import type { LibrarySortMode } from '@/src/types';

type LibraryScreenProps = {
  documents?: Array<{
    id: string;
    name: string;
    lastOpened: number;
    lastPage: number;
    pageCount: number;
    pinned?: boolean;
    finished?: boolean;
    notes?: Record<string, string>;
    readingSeconds?: number;
  }>;
  onOpenDocument?: () => void;
  onSelectDocument?: (id: string) => void;
  onRemoveDocument?: (id: string) => void;
  onRenameDocument?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onRestartDocument?: (id: string) => void;
  onToggleFinished?: (id: string) => void;
  trashCount?: number;
  onOpenTrash?: () => void;
};

const SORT_OPTIONS: { id: LibrarySortMode; label: string }[] = [
  { id: 'recent', label: 'Recent' },
  { id: 'name', label: 'Name' },
  { id: 'progress', label: 'Progress' },
];

type ReadingStatusFilter = 'all' | 'unread' | 'reading' | 'finished';

const STATUS_OPTIONS: { id: ReadingStatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'reading', label: 'Reading' },
  { id: 'finished', label: 'Finished' },
];

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function LibraryView({
  documents = [],
  onOpenDocument,
  onSelectDocument,
  onRemoveDocument,
  onRenameDocument,
  onTogglePin,
  onRestartDocument,
  onToggleFinished,
  trashCount = 0,
  onOpenTrash,
}: LibraryScreenProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<LibrarySortMode>('recent');
  const [statusFilter, setStatusFilter] = useState<ReadingStatusFilter>('all');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const emptyLibrary = documents.length === 0;
  const insights = useMemo(() => ({
    minutes: Math.floor(documents.reduce((sum, doc) => sum + (doc.readingSeconds ?? 0), 0) / 60),
    finished: documents.filter((doc) => doc.finished).length,
    notes: documents.reduce((sum, doc) => sum + Object.keys(doc.notes ?? {}).length, 0),
  }), [documents]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let base = documents;
    if (pinnedOnly) base = base.filter((doc) => doc.pinned);
    if (statusFilter === 'unread') {
      base = base.filter((doc) => !doc.finished && doc.lastPage <= 1);
    } else if (statusFilter === 'reading') {
      base = base.filter((doc) => !doc.finished && doc.lastPage > 1);
    } else if (statusFilter === 'finished') {
      base = base.filter((doc) => doc.finished);
    }
    if (needle) {
      base = base.filter(
        (doc) =>
          doc.name.toLowerCase().includes(needle) ||
          Object.values(doc.notes ?? {}).some((note) => note.toLowerCase().includes(needle)),
      );
    }
    return sortLibraryByMode(base, sortMode);
  }, [documents, query, sortMode, pinnedOnly, statusFilter]);

  const empty = emptyLibrary || filtered.length === 0;

  const continueDoc = useMemo(() => {
    if (emptyLibrary || query.trim()) return null;
    const unfinished = documents
      .filter(
        (d) =>
          !d.finished &&
          d.lastPage > 1 &&
          (d.pageCount === 0 || d.lastPage < d.pageCount),
      )
      .sort((a, b) => b.lastOpened - a.lastOpened);
    return unfinished[0] ?? null;
  }, [documents, emptyLibrary, query]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.brand} accessibilityRole="header">
        Aado
      </Text>
      <Text style={styles.title}>Your library</Text>
      <Text style={styles.subtitle}>
        {emptyLibrary
          ? 'Open a PDF to start a calm reading session.'
          : `${documents.length} recent document${documents.length === 1 ? '' : 's'}`}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add one or more PDFs"
        onPress={onOpenDocument}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
        <Text style={styles.primaryButtonText}>Add PDFs</Text>
      </Pressable>
      {onOpenTrash ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open recently deleted, ${trashCount} documents`}
          onPress={onOpenTrash}
          style={styles.trashButton}>
          <Text style={styles.trashButtonText}>Recently deleted ({trashCount})</Text>
        </Pressable>
      ) : null}

      {continueDoc ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Continue reading ${continueDoc.name}`}
          onPress={() => onSelectDocument?.(continueDoc.id)}
          style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}>
          <Text style={styles.continueEyebrow}>Continue reading</Text>
          <Text style={styles.continueTitle} numberOfLines={2}>
            {continueDoc.name}
          </Text>
          <Text style={styles.continueMeta}>
            Page {continueDoc.lastPage}
            {continueDoc.pageCount > 0 ? ` of ${continueDoc.pageCount}` : ''}
            {formatReadingProgress(continueDoc.lastPage, continueDoc.pageCount)
              ? ` · ${formatReadingProgress(continueDoc.lastPage, continueDoc.pageCount)}`
              : ''}
          </Text>
        </Pressable>
      ) : null}

      {!emptyLibrary ? (
        <View style={styles.insightsCard} accessibilityLabel={`${insights.minutes} minutes read, ${insights.finished} completed, ${insights.notes} notes`}>
          <Text style={styles.insightsTitle}>Reading insights</Text>
          <View style={styles.insightsRow}>
            <View style={styles.insight}><Text style={styles.insightValue}>{insights.minutes}</Text><Text style={styles.insightLabel}>minutes</Text></View>
            <View style={styles.insight}><Text style={styles.insightValue}>{insights.finished}</Text><Text style={styles.insightLabel}>completed</Text></View>
            <View style={styles.insight}><Text style={styles.insightValue}>{insights.notes}</Text><Text style={styles.insightLabel}>notes</Text></View>
          </View>
        </View>
      ) : null}

      {!emptyLibrary ? (
        <>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search titles and notes"
            placeholderTextColor="#6B7280"
            accessibilityLabel="Search library by title or page-note text"
            clearButtonMode="while-editing"
            style={styles.search}
          />
          <View style={styles.sortRow}>
            {SORT_OPTIONS.map((option) => {
              const active = sortMode === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Sort by ${option.label}`}
                  onPress={() => setSortMode(option.id)}
                  style={[styles.sortChip, active && styles.sortChipActive]}>
                  <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={pinnedOnly ? 'Show all documents' : 'Show pinned only'}
              onPress={() => setPinnedOnly((v) => !v)}
              style={[styles.sortChip, pinnedOnly && styles.sortChipActive]}>
              <Text style={[styles.sortChipText, pinnedOnly && styles.sortChipTextActive]}>
                Pinned
              </Text>
            </Pressable>
          </View>
          <Text style={styles.filterLabel}>Reading status</Text>
          <View style={styles.sortRow}>
            {STATUS_OPTIONS.map((option) => {
              const active = statusFilter === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${option.label.toLowerCase()} documents`}
                  accessibilityState={{ selected: active }}
                  onPress={() => setStatusFilter(option.id)}
                  style={[styles.sortChip, active && styles.sortChipActive]}>
                  <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      {empty ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            {emptyLibrary ? 'Nothing here yet' : 'No matches'}
          </Text>
          <Text style={styles.emptyBody}>
            {emptyLibrary
              ? 'Documents you open appear in this list so you can jump back to the last page you read.'
              : query.trim()
                ? `No documents match “${query.trim()}”.`
                : pinnedOnly && statusFilter === 'all'
                  ? 'No pinned documents yet. Pin a PDF to keep it here.'
                  : pinnedOnly
                    ? `No pinned ${statusFilter} documents yet.`
                    : `No ${statusFilter} documents yet.`}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filtered.map((doc) => (
            <View key={doc.id} style={[styles.row, doc.pinned && styles.rowPinned]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${doc.name}`}
                onPress={() => onSelectDocument?.(doc.id)}
                style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}>
                <View style={styles.thumb}>
                  <Text style={styles.thumbLabel}>
                    {doc.finished ? 'DONE' : doc.pinned ? 'PIN' : 'PDF'}
                  </Text>
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.docName} numberOfLines={2}>
                    {doc.name}
                  </Text>
                  <Text style={styles.docMeta}>
                    {(() => {
                      const progress = formatReadingProgress(doc.lastPage, doc.pageCount);
                      return `${doc.finished ? 'Finished · ' : ''}Page ${doc.lastPage}${
                        doc.pageCount > 0 ? ` of ${doc.pageCount}` : ''
                      }${progress ? ` · ${progress}` : ''} · ${formatRelative(doc.lastOpened)}`;
                    })()}
                  </Text>
                </View>
              </Pressable>
              <View style={styles.actions}>
                {onTogglePin ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={doc.pinned ? `Unpin ${doc.name}` : `Pin ${doc.name}`}
                    hitSlop={8}
                    onPress={() => onTogglePin(doc.id)}
                    style={[styles.actionBtn, doc.pinned && styles.pinActive]}>
                    <Text style={[styles.actionText, doc.pinned && styles.pinActiveText]}>
                      {doc.pinned ? 'Unpin' : 'Pin'}
                    </Text>
                  </Pressable>
                ) : null}
                {onToggleFinished ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      doc.finished ? `Mark ${doc.name} as unfinished` : `Mark ${doc.name} as finished`
                    }
                    hitSlop={8}
                    onPress={() => onToggleFinished(doc.id)}
                    style={[styles.actionBtn, doc.finished && styles.pinActive]}>
                    <Text style={[styles.actionText, doc.finished && styles.pinActiveText]}>
                      {doc.finished ? 'Unfinish' : 'Done'}
                    </Text>
                  </Pressable>
                ) : null}
                {onRestartDocument && doc.lastPage > 1 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Restart ${doc.name} from page 1`}
                    hitSlop={8}
                    onPress={() => onRestartDocument(doc.id)}
                    style={styles.actionBtn}>
                    <Text style={styles.renameText}>Restart</Text>
                  </Pressable>
                ) : null}
                {onRenameDocument ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Rename ${doc.name}`}
                    hitSlop={8}
                    onPress={() => onRenameDocument(doc.id)}
                    style={styles.actionBtn}>
                    <Text style={styles.renameText}>Rename</Text>
                  </Pressable>
                ) : null}
                {onRemoveDocument ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${doc.name} from library`}
                    hitSlop={8}
                    onPress={() => onRemoveDocument(doc.id)}
                    style={styles.removeBtn}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  brand: {
    fontSize: 44,
    fontWeight: '700',
    color: '#C4A574',
    letterSpacing: -1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#F4F1EA',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    lineHeight: 22,
    marginBottom: 20,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#C4A574',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#0F1419',
    fontSize: 16,
    fontWeight: '700',
  },
  trashButton: { alignSelf: 'flex-start', paddingVertical: 8, marginTop: -10, marginBottom: 14 },
  trashButtonText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  continueCard: {
    borderWidth: 1,
    borderColor: '#C4A574',
    backgroundColor: '#1A222D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 4,
  },
  continueEyebrow: {
    color: '#C4A574',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  insightsCard: { backgroundColor: '#141A22', borderWidth: 1, borderColor: '#1E2630', borderRadius: 12, padding: 14, marginBottom: 16 },
  insightsTitle: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10 },
  insightsRow: { flexDirection: 'row' }, insight: { flex: 1 }, insightValue: { color: '#F4F1EA', fontSize: 22, fontWeight: '700' }, insightLabel: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  continueTitle: {
    color: '#F4F1EA',
    fontSize: 17,
    fontWeight: '700',
  },
  continueMeta: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 2,
  },
  search: {
    borderWidth: 1,
    borderColor: '#1E2630',
    backgroundColor: '#141A22',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F4F1EA',
    fontSize: 15,
    marginBottom: 12,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#141A22',
    borderWidth: 1,
    borderColor: '#1E2630',
  },
  sortChipActive: {
    backgroundColor: '#C4A574',
    borderColor: '#C4A574',
  },
  sortChipText: {
    color: '#E8EAED',
    fontSize: 13,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: '#0F1419',
  },
  pressed: {
    opacity: 0.85,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: '#1E2630',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#141A22',
  },
  emptyTitle: {
    color: '#F4F1EA',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyBody: {
    color: '#9CA3AF',
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#141A22',
    borderWidth: 1,
    borderColor: '#1E2630',
  },
  rowPinned: {
    borderColor: '#C4A574',
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  thumb: {
    width: 48,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#1E2630',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLabel: {
    color: '#C4A574',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rowBody: {
    flex: 1,
  },
  docName: {
    color: '#F4F1EA',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  docMeta: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  actions: {
    gap: 6,
    alignItems: 'stretch',
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1E2630',
  },
  actionText: {
    color: '#C4A574',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  pinActive: {
    backgroundColor: '#C4A574',
  },
  pinActiveText: {
    color: '#0F1419',
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2A1A1A',
  },
  removeText: {
    color: '#E8A0A0',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  renameText: {
    color: '#C4A574',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
