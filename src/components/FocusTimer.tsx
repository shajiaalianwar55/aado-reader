import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ThemeTokens } from '@/src/theme/readingThemes';

type Props = {
  durationMinutes: number;
  theme: ThemeTokens;
  onComplete: () => void;
};

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function FocusTimer({ durationMinutes, theme, onComplete }: Props) {
  const durationSeconds = Math.max(1, durationMinutes) * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [running, setRunning] = useState(false);
  const deadlineRef = useRef<number | null>(null);

  useEffect(() => {
    deadlineRef.current = null;
    setRunning(false);
    setRemainingSeconds(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (!running || deadlineRef.current == null) return;
    const tick = () => {
      const deadline = deadlineRef.current;
      if (deadline == null) return;
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(next);
      if (next === 0) {
        deadlineRef.current = null;
        setRunning(false);
        onComplete();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [onComplete, running]);

  const toggle = () => {
    if (running) {
      const deadline = deadlineRef.current;
      if (deadline != null) {
        setRemainingSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
      }
      deadlineRef.current = null;
      setRunning(false);
      return;
    }
    const next = remainingSeconds > 0 ? remainingSeconds : durationSeconds;
    setRemainingSeconds(next);
    deadlineRef.current = Date.now() + next * 1000;
    setRunning(true);
  };

  const reset = () => {
    deadlineRef.current = null;
    setRunning(false);
    setRemainingSeconds(durationSeconds);
  };

  const progress = 1 - remainingSeconds / durationSeconds;

  return (
    <View style={[styles.container, { borderTopColor: theme.border }]}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Focus session</Text>
          <Text
            accessibilityLabel={`${Math.floor(remainingSeconds / 60)} minutes ${remainingSeconds % 60} seconds remaining`}
            style={[styles.time, { color: theme.text }]}>
            {formatCountdown(remainingSeconds)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={running ? 'Pause focus timer' : 'Start focus timer'}
          onPress={toggle}
          style={[styles.button, { backgroundColor: theme.accent }]}>
          <Text style={[styles.primaryText, { color: theme.background }]}>
            {running ? 'Pause' : remainingSeconds < durationSeconds ? 'Resume' : 'Start'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset focus timer"
          onPress={reset}
          style={[styles.button, styles.resetButton, { borderColor: theme.border }]}>
          <Text style={[styles.resetText, { color: theme.textMuted }]}>Reset</Text>
        </Pressable>
      </View>
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: theme.accent, width: `${Math.min(100, progress * 100)}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  copy: { flex: 1 },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  time: { fontSize: 19, fontWeight: '700', fontVariant: ['tabular-nums'], marginTop: 1 },
  button: { borderRadius: 8, paddingHorizontal: 13, paddingVertical: 9 },
  resetButton: { borderWidth: 1, backgroundColor: 'transparent' },
  primaryText: { fontSize: 13, fontWeight: '700' },
  resetText: { fontSize: 13, fontWeight: '700' },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', borderRadius: 2 },
});
