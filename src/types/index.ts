export type FitMode = 'width' | 'page';
export type ScrollMode = 'vertical' | 'paged';
export type ReadingThemeId = 'day' | 'sepia' | 'night';

export type LibraryDocument = {
  id: string;
  name: string;
  uri: string;
  lastOpened: number;
  lastPage: number;
  pageCount: number;
  bookmarks: number[];
  pinned?: boolean;
};

export type LibrarySortMode = 'recent' | 'name' | 'progress';

export type ReaderSettings = {
  theme: ReadingThemeId;
  brightness: number;
  fitMode: FitMode;
  scrollMode: ScrollMode;
  keepAwake: boolean;
};
