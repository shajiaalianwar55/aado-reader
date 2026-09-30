import { StyleSheet, Text, View } from 'react-native';
import { localDateKey } from '@/src/store/readingStats';
import type { ReadingStats } from '@/src/types';

type HeatmapDay = {
  key: string;
  label: string;
  weekday: string;
  minutes: number;
  intensity: number;
};

function cellColor(intensity: number): string {
  if (intensity <= 0) return '#202936';
  if (intensity < 0.25) return '#3E463A';
  if (intensity < 0.5) return '#6B6845';
  if (intensity < 1) return '#9A8458';
  return '#C4A574';
}

export function ReadingHeatmap({ stats }: { stats: ReadingStats }) {
  const goalSeconds = Math.max(1, stats.dailyGoalMinutes) * 60;
  const days: HeatmapDay[] = Array.from({ length: 28 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (27 - index));
    const key = localDateKey(date);
    const seconds = stats.days.find((day) => day.date === key)?.seconds ?? 0;
    return {
      key,
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weekday: date.toLocaleDateString(undefined, { weekday: 'narrow' }),
      minutes: Math.round(seconds / 60),
      intensity: Math.min(1, seconds / goalSeconds),
    };
  });
  const weeks = Array.from({ length: 4 }, (_, index) => days.slice(index * 7, index * 7 + 7));

  return (
    <View style={styles.card}>
      <View style={styles.weekdays}>
        {days.slice(0, 7).map((day) => (
          <Text key={day.key} style={styles.weekday}>{day.weekday}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {weeks.map((week) => (
          <View key={week[0].key} style={styles.week}>
            {week.map((day) => (
              <View
                key={day.key}
                accessible
                accessibilityLabel={`${day.label}: ${day.minutes} reading minutes${day.intensity >= 1 ? ', daily goal reached' : ''}`}
                style={[styles.cell, { backgroundColor: cellColor(day.intensity) }]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {[0, 0.2, 0.4, 0.75, 1].map((intensity) => (
          <View key={intensity} style={[styles.legendCell, { backgroundColor: cellColor(intensity) }]} />
        ))}
        <Text style={styles.legendText}>Goal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#141A22', borderRadius: 14, padding: 14, gap: 8 },
  weekdays: { flexDirection: 'row', gap: 7 },
  weekday: { flex: 1, color: '#6B7280', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  grid: { gap: 7 },
  week: { flexDirection: 'row', gap: 7 },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 5, borderWidth: 1, borderColor: '#2A3441' },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5, marginTop: 2 },
  legendCell: { width: 11, height: 11, borderRadius: 3 },
  legendText: { color: '#6B7280', fontSize: 10 },
});
