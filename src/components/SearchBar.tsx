import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ThemeTokens } from '@/src/theme/readingThemes';

type Props = {
  theme: ThemeTokens;
  matchCount: number;
  matchIndex: number;
  onSearch: (query: string) => void;
  onNext: () => void;
  onPrev: () => void;
};

export function SearchBar({ theme, matchCount, matchIndex, onSearch, onNext, onPrev }: Props) {
  const [query, setQuery] = useState('');

  return (
    <View style={[styles.wrap, { borderTopColor: theme.border }]}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Find in document"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel="Search in PDF"
        returnKeyType="search"
        onSubmitEditing={() => onSearch(query)}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      />
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Run search"
          onPress={() => onSearch(query)}
          style={[styles.chip, { backgroundColor: theme.accent }]}>
          <Text style={[styles.chipText, { color: theme.background }]}>Find</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous match"
          onPress={onPrev}
          style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
          <Text style={[styles.chipText, { color: theme.text }]}>Prev</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next match"
          onPress={onNext}
          style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
          <Text style={[styles.chipText, { color: theme.text }]}>Next</Text>
        </Pressable>
        <Text style={[styles.meta, { color: theme.textMuted }]}>
          {matchCount > 0 ? `${matchIndex + 1}/${matchCount}` : 'No hits'}
        </Text>
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
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {
    marginLeft: 'auto',
    fontSize: 12,
    fontWeight: '600',
  },
});
