import { StyleSheet, Text, View } from 'react-native';
import { calculateLongestStreak } from '@/src/store/readingStats';
import type { ReadingStats } from '@/src/types';

type ReadingMilestonesProps = {
  stats: ReadingStats;
  finishedDocuments: number;
};

type Milestone = {
  title: string;
  detail: string;
  current: number;
  target: number;
  unit: string;
};

export function ReadingMilestones({ stats, finishedDocuments }: ReadingMilestonesProps) {
  const totalMinutes = Math.floor(
    stats.days.reduce((total, day) => total + Math.max(0, day.seconds), 0) / 60,
  );
  const focusSessions = stats.days.reduce(
    (total, day) => total + Math.max(0, day.focusSessions ?? 0),
    0,
  );
  const longestStreak = calculateLongestStreak(stats);
  const milestones: Milestone[] = [
    { title: 'First chapter', detail: 'Read for one hour', current: totalMinutes, target: 60, unit: 'min' },
    { title: 'Habit builder', detail: 'Build a seven-day streak', current: longestStreak, target: 7, unit: 'days' },
    { title: 'Deep reader', detail: 'Read for ten hours', current: totalMinutes, target: 600, unit: 'min' },
    { title: 'Book finisher', detail: 'Finish five PDFs', current: finishedDocuments, target: 5, unit: 'PDFs' },
    { title: 'Focused', detail: 'Complete ten focus sessions', current: focusSessions, target: 10, unit: 'sessions' },
  ];
  const unlocked = milestones.filter((milestone) => milestone.current >= milestone.target).length;

  return (
    <View style={styles.card}>
      <View style={styles.summary}>
        <View>
          <Text style={styles.count}>{unlocked} of {milestones.length}</Text>
          <Text style={styles.caption}>milestones unlocked</Text>
        </View>
        <Text style={styles.badge}>{Math.round((unlocked / milestones.length) * 100)}%</Text>
      </View>

      {milestones.map((milestone) => {
        const complete = milestone.current >= milestone.target;
        const shownCurrent = Math.min(milestone.current, milestone.target);
        const progress = Math.min(100, (milestone.current / milestone.target) * 100);
        return (
          <View
            key={milestone.title}
            accessibilityLabel={`${milestone.title}. ${complete ? 'Unlocked' : `${shownCurrent} of ${milestone.target} ${milestone.unit}`}`}
            style={styles.milestone}>
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={[styles.title, complete && styles.titleComplete]}>{milestone.title}</Text>
                <Text style={styles.detail}>{milestone.detail}</Text>
              </View>
              <Text style={[styles.progressText, complete && styles.progressComplete]}>
                {complete ? 'Unlocked' : `${shownCurrent}/${milestone.target} ${milestone.unit}`}
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  complete && styles.fillComplete,
                  { width: `${progress}%` },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#141A22', borderRadius: 14, padding: 15, gap: 16 },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { color: '#F4F1EA', fontSize: 21, fontWeight: '700' },
  caption: { color: '#9CA3AF', fontSize: 11, marginTop: 2 },
  badge: { color: '#C4A574', backgroundColor: '#202936', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6, fontSize: 12, fontWeight: '800' },
  milestone: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1 },
  title: { color: '#E8EAED', fontSize: 14, fontWeight: '700' },
  titleComplete: { color: '#70BFA1' },
  detail: { color: '#7F8996', fontSize: 11, marginTop: 2 },
  progressText: { color: '#9CA3AF', fontSize: 10, fontWeight: '700' },
  progressComplete: { color: '#70BFA1' },
  track: { height: 5, backgroundColor: '#202936', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#C4A574', borderRadius: 3 },
  fillComplete: { backgroundColor: '#70BFA1' },
});
