# Aado Reader

A calm mobile PDF reader for iOS and Android, built with Expo and React Native.

## Why Aado

Aado focuses on **reading comfort** first:

- Open PDFs from your device and keep a recent library
- Continuous scroll or paged navigation
- Fit width / fit page, pinch-friendly zoom, double-tap zoom
- Day, sepia, and night themes with brightness control
- Immersive chrome that hides while you read
- In-document search, bookmarks, and last-page restore
- Page-specific reading notes with quick navigation and library search
- Shareable page-note summaries
- Library search and filtering across notes and colored highlights
- Shareable colored-annotation summaries with page references
- Starred key annotations with focused review and library-level counts
- Local reading-time, completion, and note insights with sharing
- Per-document reading-time and note totals
- Personalized time-left estimates based on observed reading pace
- Time-left sorting and an “Under 30m” smart reading filter
- Configurable daily reading goals with at-a-glance progress
- Seven-day reading activity and current streak tracking
- Thirty-day insights for reading time, longest streak, and daily-goal consistency
- Library filters for unread, in-progress, finished, and annotated documents
- One-tap reset for library search, sorting, and filters
- Library sorting by recency, title, progress, and reading time
- Custom collections for grouping and filtering related documents
- An ordered “Up next” reading queue with a dedicated library view
- Per-document finish plans with due dates and an automatic pages-per-day pace
- Non-destructive document archiving with a dedicated archive view
- Persistent 1–5 star ratings with rated-only filtering and sorting
- Page scrubber for long documents
- Keep-awake and free orientation while a document is open
- Configurable focus-session timer with pause, resume, and completion feedback
- Persistent completed focus-session totals for today and the last seven days
- Exportable and restorable JSON backups for reading data and preferences

## Run locally

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` for Android / iOS simulators.

## Project layout

- `app/(tabs)` — Library and Settings
- `app/reader/[id].tsx` — Full-screen reader
- `src/components` — Reader chrome, PDF viewer, search, bookmarks, scrubber
- `src/store` — Local library and settings persistence
- `src/theme` — Reading theme tokens

## Notes

PDF rendering uses a WebView + PDF.js pipeline so the app stays Expo-friendly. Large files may take a moment to decode on first open.

## Author

Shajia Ali Anwar  
shajiaalianwar5@gmail.com
