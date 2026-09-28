import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ThemeTokens } from '@/src/theme/readingThemes';

type Goal = {
  startPage: number;
  targetPage: number;
  totalPages: number;
  furthestPage: number;
  complete: boolean;
};

type Props = {
  theme: ThemeTokens;
  page: number;
  pageCount: number;
  onComplete: () => void;
};

export function SessionPageGoal({ theme, page, pageCount, onComplete }: Props) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const remainingPages = Math.max(0, pageCount - page + 1);
  const options = useMemo(
    () => [...new Set([5, 10, 20].map((count) => Math.min(count, remainingPages)))].filter((count) => count > 1),
    [remainingPages],
  );

  useEffect(() => {
    if (!goal || goal.complete || page <= goal.furthestPage) return;
    const furthestPage = Math.min(page, goal.targetPage);
    const complete = furthestPage >= goal.targetPage;
    setGoal({ ...goal, furthestPage, complete });
    if (complete) onComplete();
  }, [goal, onComplete, page]);

  if (pageCount <= 0 || (!goal && options.length === 0)) return null;

  if (!goal) {
    return (
      <View style={[styles.row, { borderTopColor: theme.border }]}>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Session page goal</Text>
          <Text style={[styles.hint, { color: theme.textMuted }]}>Choose how much to read now</Text>
        </View>
        {options.map((count) => (
          <Pressable
            key={count}
            accessibilityRole="button"
            accessibilityLabel={`Set a session goal of ${count} pages`}
            onPress={() => setGoal({
              startPage: page,
              targetPage: page + count - 1,
              totalPages: count,
              furthestPage: page,
              complete: false,
            })}
            style={[styles.button, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Text style={[styles.buttonText, { color: theme.text }]}>{count} pages</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  const pagesRead = Math.min(goal.totalPages, goal.furthestPage - goal.startPage + 1);
  const progress = pagesRead / goal.totalPages;
  return (
    <View style={[styles.active, { borderTopColor: theme.border }]}>
      <View style={styles.rowInner}>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: goal.complete ? theme.accent : theme.text }]}>
            {goal.complete ? 'Session goal complete' : `${pagesRead} of ${goal.totalPages} pages`}
          </Text>
          <Text style={[styles.hint, { color: theme.textMuted }]}>Target page {goal.targetPage}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={goal.complete ? 'Set another session page goal' : 'Cancel session page goal'}
          onPress={() => setGoal(null)}
          style={[styles.button, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.buttonText, { color: theme.textMuted }]}>
            {goal.complete ? 'New goal' : 'Cancel'}
          </Text>
        </Pressable>
      </View>
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View style={[styles.fill, { backgroundColor: theme.accent, width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1 },
  active: { paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1 },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  copy: { flex: 1 },
  label: { fontSize: 12, fontWeight: '700' },
  hint: { fontSize: 11, marginTop: 2 },
  button: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  buttonText: { fontSize: 12, fontWeight: '700' },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 7 },
  fill: { height: '100%', borderRadius: 2 },
});
