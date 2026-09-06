const DAY_MS = 24 * 60 * 60 * 1000;

type ReadingActivityDocument = {
  readingByDay?: Record<string, number>;
};

export type ReadingDay = {
  key: string;
  label: string;
  seconds: number;
};

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getReadingSecondsForDay(documents: ReadingActivityDocument[], key: string): number {
  return documents.reduce(
    (total, document) => total + Math.max(0, document.readingByDay?.[key] ?? 0),
    0,
  );
}

export function getRecentReadingDays(
  documents: ReadingActivityDocument[],
  dayCount = 7,
  now = new Date(),
): ReadingDay[] {
  return Array.from({ length: dayCount }, (_, index) => {
    const daysAgo = dayCount - index - 1;
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
    const key = getLocalDateKey(date);
    return {
      key,
      label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1),
      seconds: getReadingSecondsForDay(documents, key),
    };
  });
}

export function getReadingStreak(documents: ReadingActivityDocument[], now = new Date()): number {
  let streak = 0;
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // A streak remains alive until the end of today, even before today's first session.
  if (getReadingSecondsForDay(documents, getLocalDateKey(cursor)) === 0) {
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  while (getReadingSecondsForDay(documents, getLocalDateKey(cursor)) > 0) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}
