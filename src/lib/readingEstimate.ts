type ReadingEstimateInput = {
  lastPage: number;
  pageCount: number;
  readingSeconds?: number;
  finished?: boolean;
};

const MIN_SAMPLE_SECONDS = 2 * 60;
const MIN_SAMPLE_PAGES = 2;
const MIN_SECONDS_PER_PAGE = 10;
const MAX_SECONDS_PER_PAGE = 15 * 60;

export function estimateRemainingReadingSeconds({
  lastPage,
  pageCount,
  readingSeconds = 0,
  finished,
}: ReadingEstimateInput): number | null {
  const pagesRead = Math.max(0, Math.min(lastPage - 1, pageCount));
  const pagesRemaining = Math.max(0, pageCount - lastPage);
  if (
    finished ||
    pageCount <= 0 ||
    pagesRemaining === 0 ||
    pagesRead < MIN_SAMPLE_PAGES ||
    readingSeconds < MIN_SAMPLE_SECONDS
  ) {
    return null;
  }

  const observedSecondsPerPage = readingSeconds / pagesRead;
  const secondsPerPage = Math.min(
    MAX_SECONDS_PER_PAGE,
    Math.max(MIN_SECONDS_PER_PAGE, observedSecondsPerPage),
  );
  return Math.ceil(pagesRemaining * secondsPerPage);
}

export function formatRemainingReadingTime(seconds: number | null): string {
  if (seconds == null) return '';
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `~${minutes}m left`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `~${hours}h ${remainder}m left` : `~${hours}h left`;
}
