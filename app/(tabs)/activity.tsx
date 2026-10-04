import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadLibrary, loadSettings, saveSettings } from '@/src/store/libraryStore';
import { ReadingHeatmap } from '@/src/components/ReadingHeatmap';
import { ReadingMilestones } from '@/src/components/ReadingMilestones';
import {
  calculateActiveDays,
  calculateGoalDays,
  calculateLongestStreak,
  calculatePersonalBests,
  calculateRecentFocusSessions,
  calculateRecentPages,
  calculateRecentReadingMinutes,
  calculateReadingPatterns,
  calculateStreak,
  calculateWeeklyComparison,
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
    Promise.all([loadReadingStats(), loadLibrary(), loadSettings()]).then(
      ([nextStats, documents, settings]) => {
        setStats({ ...nextStats, dailyGoalMinutes: settings.dailyGoalMinutes });
        setFinished(documents.filter((doc) => doc.finished).length);
      },
    );
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
  const recentMinutes = calculateRecentReadingMinutes(stats);
  const recentPages = calculateRecentPages(stats);
  const activeDays = calculateActiveDays(stats);
  const goalDays = calculateGoalDays(stats);
  const longestStreak = calculateLongestStreak(stats);
  const recentFocusSessions = calculateRecentFocusSessions(stats);
  const currentStreak = calculateStreak(stats);
  const weeklyComparison = calculateWeeklyComparison(stats);
  const personalBests = calculatePersonalBests(stats);
  const readingPatterns = calculateReadingPatterns(stats);
  const weeklyTrend = weeklyComparison.changePercent == null
    ? 'New reading time this week'
    : `${weeklyComparison.changePercent >= 0 ? '+' : ''}${weeklyComparison.changePercent}% vs previous week`;

  const shareReport = async () => {
    const message = [
      'My Aado 30-day reading report',
      '',
      `${recentMinutes} minutes read`,
      `${recentPages} pages read`,
      `${activeDays} active reading days`,
      `${goalDays} daily goals reached`,
      `${currentStreak} day current streak`,
      `${longestStreak} day longest streak`,
      `${recentFocusSessions} focus sessions in the last 7 days`,
      `${finished} documents finished`,
    ].join('\n');
    try {
      await Share.share({ title: 'Aado reading report', message });
    } catch (error) {
      Alert.alert('Could not share report', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const updateGoal = async (goal: number) => {
    const settings = await loadSettings();
    await Promise.all([
      setDailyReadingGoal(goal),
      saveSettings({ ...settings, dailyGoalMinutes: goal }),
    ]);
    setStats((current) => ({ ...current, dailyGoalMinutes: goal }));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
      <View style={styles.headerRow}>
        <Text style={styles.brand}>Aado</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share 30-day reading report"
          onPress={shareReport}
          style={styles.shareButton}>
          <Text style={styles.shareText}>Share report</Text>
        </Pressable>
      </View>
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
        <Metric label="Day streak" value={`${currentStreak}`} />
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

      <Text style={styles.section}>WEEKLY TREND</Text>
      <View style={styles.weeklyCard}>
        <View style={styles.weeklyValues}>
          <View>
            <Text style={styles.weeklyValue}>{weeklyComparison.currentMinutes} min</Text>
            <Text style={styles.weeklyLabel}>This week · {weeklyComparison.currentPages} pages</Text>
          </View>
          <View style={styles.weeklyPrevious}>
            <Text style={styles.weeklyValue}>{weeklyComparison.previousMinutes} min</Text>
            <Text style={styles.weeklyLabel}>Previous · {weeklyComparison.previousPages} pages</Text>
          </View>
        </View>
        <Text
          style={[
            styles.weeklyTrend,
            weeklyComparison.changePercent != null && weeklyComparison.changePercent < 0
              ? styles.weeklyTrendDown
              : null,
          ]}>
          {weeklyTrend}
        </Text>
      </View>

      <Text style={styles.section}>LAST 30 DAYS</Text>
      <View style={styles.insights}>
        <Metric label="Minutes read" value={`${recentMinutes}`} />
        <Metric label="Longest streak" value={`${longestStreak}`} />
        <Metric label="Goal days" value={`${goalDays}`} />
      </View>

      <Text style={styles.section}>PERSONAL BESTS</Text>
      <View style={styles.bestsCard}>
        <PersonalBest
          label="Reading time"
          value={`${personalBests.readingMinutes} min`}
          date={personalBests.readingDate}
        />
        <PersonalBest
          label="Pages in a day"
          value={`${personalBests.pages}`}
          date={personalBests.pagesDate}
        />
        <PersonalBest
          label="Focus sessions"
          value={`${personalBests.focusSessions}`}
          date={personalBests.focusDate}
        />
      </View>

      <Text style={styles.section}>READING PATTERN</Text>
      <View
        accessibilityLabel={`${readingPatterns.averageActiveDayMinutes} average minutes per active day, ${readingPatterns.pagesPerHour} pages per hour${readingPatterns.favoriteWeekday ? `, most reading on ${readingPatterns.favoriteWeekday}` : ''}`}
        style={styles.patternCard}>
        <View style={styles.patternMetrics}>
          <View style={styles.patternMetric}>
            <Text style={styles.patternValue}>{readingPatterns.averageActiveDayMinutes} min</Text>
            <Text style={styles.patternLabel}>Average active day</Text>
          </View>
          <View style={styles.patternDivider} />
          <View style={styles.patternMetric}>
            <Text style={styles.patternValue}>{readingPatterns.pagesPerHour}</Text>
            <Text style={styles.patternLabel}>Pages per hour</Text>
          </View>
        </View>
        <Text style={styles.patternNote}>
          {readingPatterns.favoriteWeekday
            ? `Your strongest reading day is ${readingPatterns.favoriteWeekday}.`
            : 'Read on a few days to reveal your natural rhythm.'}
        </Text>
      </View>

      <Text style={styles.section}>LAST 28 DAYS</Text>
      <ReadingHeatmap stats={stats} />

      <Text style={styles.section}>MILESTONES</Text>
      <ReadingMilestones stats={stats} finishedDocuments={finished} />

      <Text style={styles.section}>FOCUS SESSIONS</Text>
      <View style={styles.focusMetrics}>
        <Metric label="Completed today" value={`${today?.focusSessions ?? 0}`} />
        <Metric label="Last 7 days" value={`${recentFocusSessions}`} />
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

function PersonalBest({ label, value, date }: { label: string; value: string; date: string | null }) {
  const formattedDate = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'Start reading to set a record';
  return (
    <View style={styles.bestRow}>
      <View>
        <Text style={styles.bestLabel}>{label}</Text>
        <Text style={styles.bestDate}>{formattedDate}</Text>
      </View>
      <Text style={styles.bestValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1419' },
  content: { padding: 24, paddingTop: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  brand: { color: '#C4A574', fontSize: 36, fontWeight: '700', letterSpacing: -1 },
  shareButton: { borderColor: '#C4A574', borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8 },
  shareText: { color: '#C4A574', fontSize: 12, fontWeight: '700' },
  title: { color: '#F4F1EA', fontSize: 22, fontWeight: '600', marginTop: 4 },
  subtitle: { color: '#9CA3AF', fontSize: 14, lineHeight: 21, marginTop: 6, marginBottom: 20 },
  hero: { backgroundColor: '#1A222D', borderColor: '#2A3441', borderWidth: 1, borderRadius: 16, padding: 18 },
  eyebrow: { color: '#C4A574', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  heroValue: { color: '#F4F1EA', fontSize: 34, fontWeight: '700', marginTop: 4 },
  heroMeta: { color: '#9CA3AF', marginTop: 2 },
  track: { height: 7, borderRadius: 4, backgroundColor: '#2A3441', overflow: 'hidden', marginTop: 14 },
  fill: { height: '100%', backgroundColor: '#C4A574' },
  metrics: { flexDirection: 'row', gap: 10, marginTop: 12 },
  insights: { flexDirection: 'row', gap: 10 },
  focusMetrics: { flexDirection: 'row', gap: 10 },
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
  weeklyCard: { backgroundColor: '#141A22', borderRadius: 14, padding: 15 },
  weeklyValues: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  weeklyPrevious: { alignItems: 'flex-end' },
  weeklyValue: { color: '#F4F1EA', fontSize: 20, fontWeight: '700' },
  weeklyLabel: { color: '#9CA3AF', fontSize: 11, marginTop: 3 },
  weeklyTrend: { color: '#70BFA1', fontSize: 12, fontWeight: '700', marginTop: 13 },
  weeklyTrendDown: { color: '#E8A0A0' },
  bestsCard: { backgroundColor: '#141A22', borderRadius: 14, paddingHorizontal: 15 },
  bestRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 13, borderBottomColor: '#202936', borderBottomWidth: 1 },
  bestLabel: { color: '#E8EAED', fontSize: 14, fontWeight: '700' },
  bestDate: { color: '#7F8996', fontSize: 11, marginTop: 2 },
  bestValue: { color: '#C4A574', fontSize: 18, fontWeight: '800' },
  patternCard: { backgroundColor: '#141A22', borderRadius: 14, padding: 15 },
  patternMetrics: { flexDirection: 'row', alignItems: 'stretch' },
  patternMetric: { flex: 1 },
  patternDivider: { width: 1, backgroundColor: '#202936', marginHorizontal: 15 },
  patternValue: { color: '#F4F1EA', fontSize: 20, fontWeight: '800' },
  patternLabel: { color: '#9CA3AF', fontSize: 11, marginTop: 3 },
  patternNote: { color: '#C4A574', fontSize: 12, fontWeight: '700', marginTop: 15 },
  goals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goal: { borderColor: '#2A3441', borderWidth: 1, backgroundColor: '#141A22', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 11 },
  goalActive: { backgroundColor: '#C4A574', borderColor: '#C4A574' },
  goalText: { color: '#E8EAED', fontWeight: '600' },
  goalTextActive: { color: '#0F1419' },
});
