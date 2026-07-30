export type FitMode = 'width' | 'page';
export type ScrollMode = 'vertical' | 'paged';
export type ReadingThemeId = 'day' | 'sepia' | 'night';
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
  pinned?: boolean;
  finished?: boolean;
};

export type LibrarySortMode = 'recent' | 'name' | 'progress';

export type ReaderSettings = {
  theme: ReadingThemeId;
  brightness: number;
  fitMode: FitMode;
  scrollMode: ScrollMode;
  keepAwake: boolean;
  haptics: boolean;
  autoHideMs: number;
};

export type DailyReadingActivity = {
  date: string;
  seconds: number;
  pages: number;
  documentIds: string[];
};

export type ReadingStats = {
  dailyGoalMinutes: number;
  days: DailyReadingActivity[];
};
