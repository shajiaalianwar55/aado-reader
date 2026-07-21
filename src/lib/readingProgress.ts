export function readingProgressPercent(lastPage: number, pageCount: number): number | null {
  if (!pageCount || pageCount < 1 || lastPage < 1) return null;
  const clamped = Math.min(Math.max(lastPage, 1), pageCount);
  return Math.round((clamped / pageCount) * 100);
}

export function formatReadingProgress(lastPage: number, pageCount: number): string | null {
  const pct = readingProgressPercent(lastPage, pageCount);
  if (pct == null) return null;
  return `${pct}%`;
}
