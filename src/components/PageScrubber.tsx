import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ThemeTokens } from '@/src/theme/readingThemes';

type Props = {
  theme: ThemeTokens;
  page: number;
  pageCount: number;
  onSelect: (page: number) => void;
};

export function PageScrubber({ theme, page, pageCount, onSelect }: Props) {
  const pages = useMemo(() => {
    if (pageCount <= 0) return [] as number[];
    if (pageCount <= 12) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }
    const set = new Set<number>([1, pageCount, page]);
    for (let i = page - 2; i <= page + 2; i++) {
      if (i >= 1 && i <= pageCount) set.add(i);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [page, pageCount]);

  if (pageCount <= 0) return null;

  return (
    <View style={[styles.wrap, { borderTopColor: theme.border }]}>
      <Text style={[styles.label, { color: theme.textMuted }]}>Jump to page</Text>
      <View style={styles.row}>
        {pages.map((p, index) => {
          const prev = pages[index - 1];
          const gap = prev != null && p - prev > 1;
          return (
            <View key={p} style={styles.item}>
              {gap ? <Text style={{ color: theme.textMuted }}>…</Text> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Go to page ${p}`}
                onPress={() => onSelect(p)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: p === page ? theme.accent : theme.surface,
                    borderColor: theme.border,
                  },
                ]}>
                <Text style={[styles.chipText, { color: p === page ? theme.background : theme.text }]}>
                  {p}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
    borderTopWidth: 1,
    paddingBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    minWidth: 36,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
