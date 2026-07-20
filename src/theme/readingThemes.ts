export type ReadingThemeId = 'day' | 'sepia' | 'night';

export type ThemeTokens = {
  id: ReadingThemeId;
  label: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  pdfTint: string;
  chrome: string;
  chromeText: string;
};

export const readingThemes: Record<ReadingThemeId, ThemeTokens> = {
  day: {
    id: 'day',
    label: 'Day',
    background: '#F7F4EF',
    surface: '#FFFFFF',
    text: '#1A1F2E',
    textMuted: '#6B7280',
    accent: '#8B6914',
    border: '#E5E0D8',
    pdfTint: 'rgba(255, 248, 235, 0)',
    chrome: 'rgba(247, 244, 239, 0.96)',
    chromeText: '#1A1F2E',
  },
  sepia: {
    id: 'sepia',
    label: 'Sepia',
    background: '#E8D9C0',
    surface: '#F0E4CE',
    text: '#3D2B1F',
    textMuted: '#7A6548',
    accent: '#8B5A2B',
    border: '#D4C4A8',
    pdfTint: 'rgba(232, 217, 192, 0.35)',
    chrome: 'rgba(232, 217, 192, 0.96)',
    chromeText: '#3D2B1F',
  },
  night: {
    id: 'night',
    label: 'Night',
    background: '#0F1419',
    surface: '#1A222D',
    text: '#E8EAED',
    textMuted: '#9CA3AF',
    accent: '#C4A574',
    border: '#2A3441',
    pdfTint: 'rgba(15, 20, 25, 0.45)',
    chrome: 'rgba(15, 20, 25, 0.96)',
    chromeText: '#E8EAED',
  },
};

export const defaultReadingTheme: ReadingThemeId = 'night';
