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
- Page scrubber for long documents
- Keep-awake and free orientation while a document is open

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
