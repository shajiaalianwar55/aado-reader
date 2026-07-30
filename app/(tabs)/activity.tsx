import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadLibrary } from '@/src/store/libraryStore';
import {
  calculateStreak,
  loadReadingStats,
  localDateKey,
  setDailyReadingGoal,
} from '@/src/store/readingStats';
import type { ReadingStats } from '@/src/types';

const EMPTY: ReadingStats = { dailyGoalMinutes: 20, days: [] };

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<ReadingStats>(EMPTY);
  const [finished, setFinished] = useState(0);

  const refresh = useCallback(() => {
    Promise.all([loadReadingStats(), loadLibrary()]).then(([nextStats, documents]) => {
      setStats(nextStats);
      setFinished(documents.filter((doc) => doc.finished).length);
    });
  }, []);

  useFocusEffect(refresh);

  const today = stats.days.find((day) => day.date === localDateKey());
  const minutes = Math.round((today?.seconds ?? 0) / 60);
  const progress = Math.min(100, Math.round((minutes / stats.dailyGoalMinutes) * 100));
  const recentDays = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    const key = localDateKey(date);
    return {
      key,
      label: date.toLocaleDateString(undefined, { weekday: 'narrow' }),
      minutes: Math.round((stats.days.find((day) => day.date === key)?.seconds ?? 0) / 60),
    };
  });
  const maxMinutes = Math.max(stats.dailyGoalMinutes, ...recentDays.map((day) => day.minutes), 1);

  const updateGoal = async (goal: number) => {
    await setDailyReadingGoal(goal);
    setStats((current) => ({ ...current, dailyGoalMinutes: goal }));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
      <Text style={styles.brand}>Aado</Text>
      <Text style={styles.title}>Reading activity</Text>
      <Text style={styles.subtitle}>A quiet record of the time you make for reading.</Text>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>TODAY</Text>
        <Text style={styles.heroValue}>{minutes} min</Text>
        <Text style={styles.heroMeta}>{today?.pages ?? 0} pages · {progress}% of goal</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric label="Day streak" value={`${calculateStreak(stats)}`} />
        <Metric label="Finished" value={`${finished}`} />
        <Metric label="Today’s PDFs" value={`${today?.documentIds.length ?? 0}`} />
      </View>

      <Text style={styles.section}>LAST 7 DAYS</Text>
      <View style={styles.chart}>
        {recentDays.map((day) => (
          <View key={day.key} style={styles.barColumn}>
            <Text style={styles.barValue}>{day.minutes || ''}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { height: `${Math.max(4, (day.minutes / maxMinutes) * 100)}%` }]} />
            </View>
            <Text style={styles.day}>{day.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>DAILY GOAL</Text>
      <View style={styles.goals}>
        {[10, 20, 30, 45].map((goal) => {
          const active = stats.dailyGoalMinutes === goal;
          return (
            <Pressable
              key={goal}
              accessibilityRole="button"
              accessibilityLabel={`Set daily reading goal to ${goal} minutes`}
              onPress={() => updateGoal(goal)}
              style={[styles.goal, active && styles.goalActive]}>
              <Text style={[styles.goalText, active && styles.goalTextActive]}>{goal} min</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1419' },
  content: { padding: 24, paddingTop: 12 },
  brand: { color: '#C4A574', fontSize: 36, fontWeight: '700', letterSpacing: -1 },
  title: { color: '#F4F1EA', fontSize: 22, fontWeight: '600', marginTop: 4 },
  subtitle: { color: '#9CA3AF', fontSize: 14, lineHeight: 21, marginTop: 6, marginBottom: 20 },
  hero: { backgroundColor: '#1A222D', borderColor: '#2A3441', borderWidth: 1, borderRadius: 16, padding: 18 },
  eyebrow: { color: '#C4A574', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  heroValue: { color: '#F4F1EA', fontSize: 34, fontWeight: '700', marginTop: 4 },
  heroMeta: { color: '#9CA3AF', marginTop: 2 },
  track: { height: 7, borderRadius: 4, backgroundColor: '#2A3441', overflow: 'hidden', marginTop: 14 },
  fill: { height: '100%', backgroundColor: '#C4A574' },
  metrics: { flexDirection: 'row', gap: 10, marginTop: 12 },
  metric: { flex: 1, backgroundColor: '#141A22', borderRadius: 12, padding: 12, alignItems: 'center' },
  metricValue: { color: '#F4F1EA', fontSize: 22, fontWeight: '700' },
  metricLabel: { color: '#9CA3AF', fontSize: 11, marginTop: 3, textAlign: 'center' },
  section: { color: '#9CA3AF', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginTop: 25, marginBottom: 10 },
  chart: { height: 150, flexDirection: 'row', gap: 8, alignItems: 'flex-end', backgroundColor: '#141A22', borderRadius: 14, padding: 14 },
  barColumn: { flex: 1, height: '100%', alignItems: 'center' },
  barValue: { color: '#9CA3AF', fontSize: 10, height: 15 },
  barTrack: { flex: 1, width: 16, borderRadius: 8, backgroundColor: '#202936', overflow: 'hidden', justifyContent: 'flex-end' },
  bar: { width: '100%', backgroundColor: '#C4A574', borderRadius: 8 },
  day: { color: '#9CA3AF', fontSize: 11, marginTop: 5 },
  goals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goal: { borderColor: '#2A3441', borderWidth: 1, backgroundColor: '#141A22', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 11 },
  goalActive: { backgroundColor: '#C4A574', borderColor: '#C4A574' },
  goalText: { color: '#E8EAED', fontWeight: '600' },
  goalTextActive: { color: '#0F1419' },
});
