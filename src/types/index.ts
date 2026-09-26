export type FitMode = 'width' | 'page';
export type ScrollMode = 'vertical' | 'paged';
export type ReadingThemeId = 'day' | 'sepia' | 'night';
export type DocumentRating = 1 | 2 | 3 | 4 | 5;
export type AnnotationColor = 'gold' | 'rose' | 'mint';

export type PageAnnotation = {
  id: string;
  page: number;
  note: string;
  color: AnnotationColor;
  createdAt: number;
  updatedAt: number;
};

export type LibraryDocument = {
  id: string;
  name: string;
  uri: string;
  lastOpened: number;
  lastPage: number;
  pageCount: number;
  bookmarks: number[];
  annotations?: PageAnnotation[];
  notes?: Record<string, string>;
  readingSeconds?: number;
  readingByDay?: Record<string, number>;
  collection?: string;
  archived?: boolean;
  rating?: DocumentRating;
  pinned?: boolean;
  queuedAt?: number;
  targetDate?: number;
  finished?: boolean;
};

export type TrashedDocument = LibraryDocument & {
  deletedAt: number;
};

export type LibrarySortMode =
  | 'recent'
  | 'name'
  | 'progress'
  | 'readingTime'
  | 'timeLeft'
  | 'queue'
  | 'rating';

export type ReaderSettings = {
  theme: ReadingThemeId;
  brightness: number;
  fitMode: FitMode;
  scrollMode: ScrollMode;
  keepAwake: boolean;
  haptics: boolean;
  autoHideMs: number;
  dailyGoalMinutes: number;
  focusSessionMinutes: number;
};

export type DailyReadingActivity = {
  date: string;
  seconds: number;
  pages: number;
  documentIds: string[];
  focusSessions?: number;
};

export type ReadingStats = {
  dailyGoalMinutes: number;
  days: DailyReadingActivity[];
};
