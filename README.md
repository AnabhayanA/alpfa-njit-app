# ALPFA NJIT App

The official mobile app project for **ALPFA at New Jersey Institute of Technology**. Built with Expo, React Native, and TypeScript, the app gives chapter members one place to discover events, meet the E-Board, learn about ALPFA NJIT, and share chapter photos.

> **Project status:** Core features are implemented and working. The next phase is final animation, visual polish, QA, and production-build preparation.

## What the app does

### Home
A chapter-focused landing experience with quick access to ALPFA NJIT content and the main areas of the app.

### Events & Google Calendar
- Displays upcoming ALPFA NJIT events from the chapter calendar.
- Shows event date, time, location, and details.
- Supports local event reminders with `expo-notifications`.
- Calendar requests use the deployed backend so the feature works consistently across supported platforms.

### E-Board
- Directory of the current ALPFA NJIT E-Board.
- Officer photos, positions, graduation years, bios, goals, and role information.
- LinkedIn links for E-Board members.
- Interactive profile/card experience.

### Capture & Share
The Capture screen is built for sharing chapter photos directly to the ALPFA NJIT Google Drive.

Current features include:
- Take a photo in-app or choose one from the photo library.
- Front/rear camera switching.
- Native iPhone dual-camera support on compatible devices/builds.
- Photo naming before upload.
- Filters: **Normal, Warm, Cool, B&W, Vintage, and ALPFA**.
- Filtered images are rendered with React Native Skia before upload.
- Optional photo location.
- Location permission is requested only after the user chooses **Add Location**.
- An in-app confirmation explains that the location will be attached to the photo.
- Reverse geocoding converts coordinates into a readable city/region label instead of displaying raw coordinates.
- The location label can be removed before sharing.
- The location label can be dragged to a preferred position on the photo.
- The selected location position is composited into the uploaded JPEG.
- Photos upload to the chapter's Google Shared Drive through the deployed backend.

### Navigation & UI
- Bottom navigation: **Home, Events, Capture, EBoard, About**.
- Swipe navigation between regular screens; Capture disables global swiping so camera/photo gestures remain usable.
- Responsive React Native layout.
- Shared ALPFA NJIT visual theme.
- Loading/splash experience already exists and is scheduled for final animation polish.

## Tech stack

| Area | Technology |
| --- | --- |
| App | Expo SDK 57 |
| UI | React 19 + React Native 0.86 |
| Language | TypeScript |
| Navigation | React Navigation |
| Animation | React Native Reanimated |
| Image rendering | React Native Skia |
| Camera | Expo Camera |
| Photo library | Expo Image Picker |
| Location | Expo Location |
| Notifications | Expo Notifications |
| Local persistence | AsyncStorage |
| File handling | Expo File System |
| Backend | Cloudflare Worker |
| Calendar | Google Calendar through backend |
| Photo storage | Google Drive / Shared Drive |
| Native iOS camera | Swift MultiCam module |

## Architecture

```text
ALPFA NJIT App
│
├── Home / Events / EBoard / About
│
├── Google Calendar
│   └── App → Cloudflare Worker → Calendar data
│
└── Capture
    ├── Expo Camera / Photo Library
    ├── Skia filters + location composition
    └── App → Cloudflare Worker → Google Shared Drive
```

Google OAuth credentials and Drive authorization are **not stored in the mobile app or this repository**. The deployed backend handles the Google integration.

## Project structure

```text
App.tsx
app.json
components/
  ALPFALoadingScreen.tsx
  BottomNav.tsx
  EventCard.tsx
  EBoardCard.tsx
constants/
  config.ts
  theme.ts
screens/
  HomeScreen.tsx
  EventsScreen.tsx
  EBoardScreen.tsx
  AboutScreen.tsx
  CaptureScreen.tsx
modules/
  alpfa-dual-camera/
utils/
  calendarUtils.ts
  driveUpload.ts
  eventNotifications.ts
  responsive.ts
  ThemeContext.tsx
  useTheme.ts
scripts/
  web-proxy.mjs
```

The Cloudflare Worker used by the production integrations is deployed separately and is intentionally not stored in this repository.

## Getting started

### Requirements

- Node.js LTS
- npm
- Expo Go for normal development/testing
- A physical device for camera/location testing

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

If Metro needs a clean restart:

```bash
npx expo start -c
```

Other available commands:

```bash
npm run android
npm run ios
npm run web
```

> Windows cannot run Apple's iOS Simulator. An iPhone with Expo Go can be used for normal testing.

## Expo Go vs development/production builds

Most of the app can be developed and tested with **Expo Go**, including navigation, events, filters, photo uploads, and location behavior.

The custom Swift dual-camera module cannot be loaded by Expo Go. Dual-camera functionality requires an iOS development or production build and a compatible physical iPhone.

A development build can be created with EAS:

```bash
npx eas-cli build --profile development --platform ios
npx expo start --dev-client
```

Native-module changes require a new native build; Fast Refresh cannot load new Swift code into an existing client.

## Photo upload flow

```text
Take/select photo
      ↓
Choose filter
      ↓
Enter photo name
      ↓
Optionally Add Location
      ↓
User confirms location use
      ↓
OS permission requested if needed
      ↓
Readable location label added and positioned
      ↓
Skia creates final JPEG when composition is needed
      ↓
Cloudflare Worker validates request
      ↓
Google Drive upload
```

The upload backend includes request validation, image signature/type validation, a file-size limit, filename sanitization, and rate limiting. A client-side API key can provide a basic request hurdle, but it should not be treated as a secret because values shipped in a mobile app can be extracted.

## Privacy & permissions

The app requests permissions only for features that need them:

- **Camera** — taking chapter photos.
- **Photo library** — selecting an existing photo.
- **Notifications** — reminders explicitly requested by the user.
- **Location** — requested only when the user chooses to add a location to a photo.

Adding a location is optional. Declining location permission does not prevent a photo from being shared. The photo uses a readable place label rather than displaying raw latitude/longitude.

The app does not require an ALPFA member login for its current feature set.

## Google Drive integration

The mobile app does not contain Google client secrets or refresh tokens. It sends the prepared photo to the deployed Cloudflare Worker, and the Worker performs the authorized Google Drive upload.

The destination is the ALPFA NJIT Shared Drive/folder configured on the backend.

## Calendar integration

Calendar data is fetched through the deployed backend rather than relying on a browser-only calendar request. This keeps the Events experience consistent between native and web environments.

## Native iPhone dual camera

The project includes a local Swift module under `modules/alpfa-dual-camera/`. On supported iPhones, it uses Apple's MultiCam capabilities to provide a front + rear capture experience.

When the native module is unavailable—such as in Expo Go or on an unsupported device—the app falls back to the standard single-camera experience.

## Current development checklist

- [x] Main navigation
- [x] Home screen
- [x] Google Calendar events
- [x] Event reminders
- [x] E-Board profiles and LinkedIn links
- [x] About experience
- [x] Camera and photo-library capture
- [x] Google Drive photo uploads
- [x] Photo naming
- [x] Photo filters
- [x] Optional location consent
- [x] Draggable location label
- [x] Location composited into uploaded photo
- [x] Backend upload validation and rate limiting
- [x] iPhone dual-camera module with graceful fallback
- [ ] Final loading/splash animation polish
- [ ] Final cross-device QA
- [ ] Production iOS/Android build preparation

## Next phase

The next development session is focused on **animation and visual polish**, especially the ALPFA + NJIT Highlander opening animation. After that, the remaining work is final QA and production-build preparation.

## Maintainers

Built for the **ALPFA NJIT chapter**.

## License

This project is maintained by and for ALPFA NJIT.
