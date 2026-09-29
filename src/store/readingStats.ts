import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/store/constants';
import type { ReadingStats } from '@/src/types';

const DEFAULT_STATS: ReadingStats = { dailyGoalMinutes: 20, days: [] };

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function loadReadingStats(): Promise<ReadingStats> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.readingStats);
  if (!raw) return DEFAULT_STATS;
  try {
    const parsed = JSON.parse(raw) as Partial<ReadingStats>;
    return {
      dailyGoalMinutes: parsed.dailyGoalMinutes ?? DEFAULT_STATS.dailyGoalMinutes,
      days: Array.isArray(parsed.days) ? parsed.days : [],
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export async function recordReadingSession(
  documentId: string,
  seconds: number,
  pages: number,
): Promise<void> {
  if (seconds < 1) return;
  const stats = await loadReadingStats();
  const date = localDateKey();
  const existing = stats.days.find((day) => day.date === date);
  const day = existing ?? { date, seconds: 0, pages: 0, documentIds: [] };
  day.seconds += Math.round(seconds);
  day.pages += Math.max(0, pages);
  if (!day.documentIds.includes(documentId)) day.documentIds.push(documentId);
  const days = [...stats.days.filter((item) => item.date !== date), day]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 365);
  await AsyncStorage.setItem(STORAGE_KEYS.readingStats, JSON.stringify({ ...stats, days }));
}

export async function recordFocusSession(): Promise<void> {
  const stats = await loadReadingStats();
  const date = localDateKey();
  const existing = stats.days.find((day) => day.date === date);
  const day = existing ?? { date, seconds: 0, pages: 0, documentIds: [] };
  day.focusSessions = (day.focusSessions ?? 0) + 1;
  const days = [...stats.days.filter((item) => item.date !== date), day]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 365);
  await AsyncStorage.setItem(STORAGE_KEYS.readingStats, JSON.stringify({ ...stats, days }));
}

export async function setDailyReadingGoal(dailyGoalMinutes: number): Promise<void> {
  const stats = await loadReadingStats();
  await AsyncStorage.setItem(
    STORAGE_KEYS.readingStats,
    JSON.stringify({ ...stats, dailyGoalMinutes }),
  );
}

export function calculateStreak(stats: ReadingStats, today = new Date()): number {
  const active = new Set(stats.days.filter((day) => day.seconds > 0).map((day) => day.date));
  let streak = 0;
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // Keep an active streak visible until today ends, even before today's session.
  if (!active.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (active.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function recentDateKeys(days: number, today = new Date()): Set<string> {
  return new Set(
    Array.from({ length: Math.max(0, days) }, (_, offset) => {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      date.setDate(date.getDate() - offset);
      return localDateKey(date);
    }),
  );
}

export function calculateRecentReadingMinutes(
  stats: ReadingStats,
  days = 30,
  today = new Date(),
): number {
  const includedDates = recentDateKeys(days, today);
  const seconds = stats.days
    .filter((day) => includedDates.has(day.date))
    .reduce((total, day) => total + Math.max(0, day.seconds), 0);
  return Math.round(seconds / 60);
}

export function calculateRecentPages(
  stats: ReadingStats,
  days = 30,
  today = new Date(),
): number {
  const includedDates = recentDateKeys(days, today);
  return stats.days
    .filter((day) => includedDates.has(day.date))
    .reduce((total, day) => total + Math.max(0, day.pages), 0);
}

export function calculateActiveDays(
  stats: ReadingStats,
  days = 30,
  today = new Date(),
): number {
  const includedDates = recentDateKeys(days, today);
  return stats.days.filter((day) => includedDates.has(day.date) && day.seconds > 0).length;
}

export function calculateGoalDays(
  stats: ReadingStats,
  days = 30,
  today = new Date(),
): number {
  const includedDates = recentDateKeys(days, today);
  const goalSeconds = stats.dailyGoalMinutes * 60;
  return stats.days.filter(
    (day) => includedDates.has(day.date) && day.seconds >= goalSeconds,
  ).length;
}

export function calculateRecentFocusSessions(
  stats: ReadingStats,
  days = 7,
  today = new Date(),
): number {
  const includedDates = recentDateKeys(days, today);
  return stats.days
    .filter((day) => includedDates.has(day.date))
    .reduce((total, day) => total + (day.focusSessions ?? 0), 0);
}

export function calculateLongestStreak(stats: ReadingStats): number {
  const activeDates = [...new Set(
    stats.days.filter((day) => day.seconds > 0).map((day) => day.date),
  )].sort();
  let longest = 0;
  let current = 0;
  let previous = '';

  activeDates.forEach((dateKey) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() - 1);
    current = previous === localDateKey(date) ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = dateKey;
  });

  return longest;
}
