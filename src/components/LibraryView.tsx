import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatReadingProgress } from '@/src/lib/readingProgress';

type LibraryScreenProps = {
  documents?: Array<{
    id: string;
    name: string;
    lastOpened: number;
    lastPage: number;
    pageCount: number;
  }>;
  onOpenDocument?: () => void;
  onSelectDocument?: (id: string) => void;
  onRemoveDocument?: (id: string) => void;
};

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
}: LibraryScreenProps) {
  const insets = useSafeAreaInsets();
  const empty = documents.length === 0;

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
        {empty
          ? 'Open a PDF to start a calm reading session.'
          : `${documents.length} recent document${documents.length === 1 ? '' : 's'}`}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open a PDF"
        onPress={onOpenDocument}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
        <Text style={styles.primaryButtonText}>Open PDF</Text>
      </Pressable>

      {empty ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyBody}>
            Documents you open appear in this list so you can jump back to the last page you read.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {documents.map((doc) => (
            <View key={doc.id} style={styles.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${doc.name}`}
                onPress={() => onSelectDocument?.(doc.id)}
                style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}>
                <View style={styles.thumb}>
                  <Text style={styles.thumbLabel}>PDF</Text>
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.docName} numberOfLines={2}>
                    {doc.name}
                  </Text>
                  <Text style={styles.docMeta}>
                    {(() => {
                      const progress = formatReadingProgress(doc.lastPage, doc.pageCount);
                      return `Page ${doc.lastPage}${doc.pageCount > 0 ? ` of ${doc.pageCount}` : ''}${
                        progress ? ` · ${progress}` : ''
                      } · ${formatRelative(doc.lastOpened)}`;
                    })()}
                  </Text>
                </View>
              </Pressable>
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
    marginBottom: 24,
  },
  primaryButtonText: {
    color: '#0F1419',
    fontSize: 16,
    fontWeight: '700',
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
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#141A22',
    borderWidth: 1,
    borderColor: '#1E2630',
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
  },
});
