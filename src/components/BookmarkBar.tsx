import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ThemeTokens } from '@/src/theme/readingThemes';

type Props = {
  theme: ThemeTokens;
  page: number;
  bookmarks: number[];
  onToggle: () => void;
  onJump: (page: number) => void;
};

export function BookmarkBar({ theme, page, bookmarks, onToggle, onJump }: Props) {
  const bookmarked = bookmarks.includes(page);

  return (
    <View style={[styles.wrap, { borderTopColor: theme.border }]}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          onPress={onToggle}
          style={[styles.chip, { backgroundColor: bookmarked ? theme.accent : theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.chipText, { color: bookmarked ? theme.background : theme.text }]}>
            {bookmarked ? 'Bookmarked' : 'Bookmark page'}
          </Text>
        </Pressable>
        <Text style={[styles.meta, { color: theme.textMuted }]}>
          {bookmarks.length} saved
        </Text>
      </View>
      {bookmarks.length > 0 ? (
        <View style={styles.list}>
          {bookmarks.map((b) => (
            <Pressable
              key={b}
              accessibilityRole="button"
              accessibilityLabel={`Jump to bookmark page ${b}`}
              onPress={() => onJump(b)}
              style={[styles.pageChip, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Text style={[styles.chipText, { color: theme.text }]}>p.{b}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
    borderTopWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  pageChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
});
