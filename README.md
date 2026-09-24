# ALPFA NJIT App

The official mobile app project for **ALPFA at New Jersey Institute of Technology**. Built with Expo, React Native, and TypeScript, the app gives chapter members one place to discover events, meet the E-Board, learn about ALPFA NJIT, and share chapter photos.

> **Project status:** **~85% complete toward the first public App Store release.** Core app features are implemented and working. The remaining work is mainly physical-device QA, Apple Developer/App Store setup, production builds, TestFlight, and final store submission.

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
- Double-tap the live camera preview to switch between front and rear cameras.
- Camera zoom controls for supported native and web cameras.
- Native iPhone dual-camera support on compatible devices/builds.
- Photo naming before upload.
- Filters: **Normal, Warm, Cool, B&W, Vintage, and ALPFA**.
- Filtered images are rendered with React Native Skia on native builds.
- Web uploads bake the selected filter into the JPEG pixels before the file is sent to Drive.
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
- Finished ALPFA × NJIT opening animation: the original ALPFA SVG draws into place, the connector lines reveal, the completed lockup holds briefly, then transitions into Home with a fast zoom.

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

## Launch progress — ~85%

This percentage is a practical project estimate, not an automated measurement. It treats a **public iOS App Store release** as 100%.

### App features — complete

- [x] Main navigation
- [x] Home screen
- [x] Google Calendar events through deployed backend
- [x] Event reminders
- [x] E-Board profiles and LinkedIn links
- [x] About screen
- [x] Camera and photo-library capture
- [x] Front/rear camera switching
- [x] Double-tap camera switching
- [x] Camera zoom controls
- [x] Google Drive photo uploads
- [x] Photo naming
- [x] Normal, Warm, Cool, B&W, Vintage, and ALPFA filters
- [x] Filters baked into uploaded photos on web
- [x] Optional photo location
- [x] Draggable location label
- [x] Location composited into uploaded photo
- [x] Backend upload validation and rate limiting
- [x] iPhone dual-camera module with graceful fallback
- [x] Final ALPFA × NJIT loading/splash animation
- [x] Public Privacy Policy page
- [x] Public Support page

### Remaining launch work — ~15%

- [ ] Enroll in the Apple Developer Program
- [ ] Connect the Apple Developer account to Expo/EAS
- [ ] Confirm final iOS bundle/signing configuration
- [ ] Create the App Store Connect app record
- [ ] Create a production iOS build with EAS
- [ ] Install and test the native build on a physical iPhone
- [ ] Test camera switching, zoom, filters, location, uploads, calendar, reminders, links, and permissions on iOS
- [ ] Upload the build to TestFlight
- [ ] Complete App Store listing information, screenshots, privacy answers, age rating, and required metadata
- [ ] Run final release QA and fix any device-specific issues
- [ ] Submit the iOS app for Apple review
- [ ] Release after approval

### What “100%” means

For this README, **100% means the first production version is approved and available on the iOS App Store**. Android/Google Play publication can be tracked as a separate release milestone afterward.

## Opening animation

The app now includes the completed ALPFA × NJIT opening sequence. The NJIT Highlander lockup remains anchored while the original ALPFA SVG geometry is progressively revealed, followed by the original connector geometry and ALPFA lettering. The completed logo holds briefly and then uses a fast zoom transition into Home.

The animation preserves the original logo geometry rather than recreating the visible mark with substitute strokes. It is implemented with React Native animation and `react-native-svg` reveal/clipping techniques that remain compatible with the web build.

## Next phase

Core feature development is substantially complete. The immediate next phase is the **iOS release pipeline**: Apple Developer enrollment → EAS production build → physical-iPhone QA → TestFlight → App Store metadata/privacy review → Apple submission.

The app is currently estimated at **~85% of the way to its first public iOS release**. This number will be updated as launch milestones are completed.

## Maintainers

Built for the **ALPFA NJIT chapter**.

## License

This project is maintained by and for ALPFA NJIT.
