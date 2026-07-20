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
};

export type ReaderSettings = {
  theme: ReadingThemeId;
  brightness: number;
  fitMode: FitMode;
  scrollMode: ScrollMode;
  keepAwake: boolean;
};
