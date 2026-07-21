import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ThemeTokens } from '@/src/theme/readingThemes';

type Props = {
  theme: ThemeTokens;
  page: number;
  pageCount: number;
  onSelect: (page: number) => void;
};

export function PageScrubber({ theme, page, pageCount, onSelect }: Props) {
  const [draft, setDraft] = useState('');

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

  const submitGoTo = () => {
    const parsed = Number.parseInt(draft, 10);
    if (!Number.isFinite(parsed)) return;
    onSelect(parsed);
    setDraft('');
  };

  return (
    <View style={[styles.wrap, { borderTopColor: theme.border }]}>
      <Text style={[styles.label, { color: theme.textMuted }]}>Jump to page</Text>
      <View style={styles.goRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          keyboardType="number-pad"
          returnKeyType="go"
          placeholder={`1–${pageCount}`}
          placeholderTextColor={theme.textMuted}
          accessibilityLabel="Enter page number"
          onSubmitEditing={submitGoTo}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to entered page"
          onPress={submitGoTo}
          style={[styles.goBtn, { backgroundColor: theme.accent }]}>
          <Text style={[styles.goBtnText, { color: theme.background }]}>Go</Text>
        </Pressable>
      </View>
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
  goRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  goBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  goBtnText: {
    fontWeight: '700',
    fontSize: 14,
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
