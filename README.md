# ALPFA NJIT App

A mobile app for the **ALPFA NJIT** chapter (Association of Latino Professionals For America, NJIT chapter) built with [Expo](https://expo.dev) and React Native. The app gives members and prospective members a single place to see upcoming events, meet the E-Board, learn about the organization, and join.

## Purpose

ALPFA NJIT connects students with professional development, networking, leadership, and career opportunities. This app exists to make that easier by putting the chapter's most useful information in students' pockets:

- **Never miss an event** — events pull live from the chapter's public Google Calendar, and members can opt in to a local reminder notification before an event starts.
- **Know the leadership** — an interactive E-Board directory with flip-card profiles (bio, goals, role, and social links) for each officer.
- **Learn about the chapter** — mission, how to get involved, and links to all of ALPFA NJIT's official channels.
- **Join in one tap** — quick links to Highlander Hub, social media, and the chapter website.
- **Look right on every device** — a responsive layout that adapts to phone/tablet sizes, and a full light/dark theme that automatically follows the device's system appearance setting.

## Features

- 📅 **Live events feed** — parses the ALPFA NJIT public iCal/Google Calendar feed, groups events by month, and shows date/time/location/description (`utils/calendarUtils.ts`).
- 🔔 **Event reminders** — a "Notify Me" toggle on each event card schedules a local notification ~30 minutes before the event starts, using `expo-notifications` with reminder state persisted via `@react-native-async-storage/async-storage` (`utils/eventNotifications.ts`).
- 🧑‍🤝‍🧑 **E-Board directory** — animated 3D flip cards for each officer with headshot, position, bio, goals, and LinkedIn/Instagram/email links.
- 🌗 **Light & dark mode** — a `useTheme()` hook (`utils/useTheme.ts`) reads the system color scheme and every screen renders from a shared light/dark color palette (`constants/theme.ts`).
- 📱 **Responsive layout** — a `useResponsive()` hook (`utils/responsive.ts`) adapts padding, font sizes, and grid columns for small phones, phones, and tablets.
- 🔗 **Deep links out** — one-tap links to the chapter website, Instagram, LinkedIn, Highlander Hub, and email.
- 📸 **Photo capture to Drive** — an in-app camera (Home → "Share a Photo") lets members snap a photo and send it straight to the ALPFA NJIT Google Drive via a small backend (`screens/CaptureScreen.tsx`, `utils/driveUpload.ts`, `server/`).

## Tech Stack

- [Expo](https://expo.dev) SDK 54 (managed workflow)
- React 19 / React Native 0.81
- TypeScript
- React Navigation (bottom tabs + a root stack for the modal camera screen)
- `expo-camera` for the in-app photo capture screen
- `expo-notifications` for local event reminders
- `@react-native-async-storage/async-storage` for persisting reminder state
- `react-native-web` for the web preview build

## Project Structure

```
App.tsx                  App entry: splash screen, theme, and tab navigator
app.json                 Expo app config (icons, splash, notification plugin, etc.)
components/
  BottomNav.tsx           Custom animated bottom tab bar
  EventCard.tsx           Flip card for a single event + reminder toggle
  EBoardCard.tsx          Flip card for a single E-Board member
constants/
  theme.ts                Design tokens: light/dark color palettes, spacing, typography
screens/
  HomeScreen.tsx           Landing screen with quick links and highlights
  EventsScreen.tsx         Upcoming events grouped by month
  EventDetailsScreen.tsx   Full event detail view
  EBoardScreen.tsx         E-Board member directory
  AboutScreen.tsx          Chapter mission and social links
  JoinScreen.tsx           How to join ALPFA NJIT
  CaptureScreen.tsx        In-app camera that uploads photos to Google Drive
utils/
  calendarUtils.ts         Fetches and parses the public Google Calendar feed
  eventNotifications.ts    Schedules/cancels local event reminder notifications
  useTheme.ts              Hook that returns the active light/dark color palette
  responsive.ts            Hook for responsive spacing/sizing across device sizes
  driveUpload.ts           Uploads a captured photo to the photo-upload backend
scripts/
  web-proxy.mjs            Local dev proxy so the web build can reach the calendar feed
server/
  index.js                 Backend that uploads received photos to Google Drive (see server/README.md)
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) LTS
- npm (bundled with Node)
- [Expo Go](https://expo.dev/go) on your phone (for the fastest way to preview on a device)

### Install dependencies

```bash
npm install
```

### Run the app

```bash
npm start       # Starts the Expo dev server (scan the QR code with Expo Go)
npm run android # Opens on a connected Android device/emulator
npm run ios     # Opens on an iOS simulator (macOS only)
npm run web     # Runs a local web preview with a small proxy for calendar data
```

## Notifications

Event reminders are **local (in-app) notifications** — no push server or backend required. The first time a user taps "Notify Me" on an event, the app requests notification permission, then schedules a one-time reminder for 30 minutes before the event start. Reminder state is stored on-device and cleared automatically if canceled.

## Theming

Colors live in `constants/theme.ts` as `lightPalette` and `darkPalette`. Brand colors (navy header, burgundy accent) stay constant in both modes since they already read well on light or dark backgrounds; only neutral backgrounds, surfaces, and text colors switch. Screens and components read the active palette via the `useTheme()` hook, so the whole app updates immediately if the user changes their system appearance.

## Photo Capture → Google Drive

Members can capture a photo in-app (Home → "Share a Photo") and send it to a Google Drive folder connected to the ALPFA email. The app never holds Google credentials directly — it POSTs the photo to a small backend in `server/`, which uploads it to Drive using a service account. See `server/README.md` for full setup and deployment steps, then update `constants/config.ts` with your deployed backend URL.

## Content Source

Event data is pulled from ALPFA NJIT's public Google Calendar. E-Board member info, bios, and mission content are maintained directly in the source files under `screens/` and can be updated each semester as officers change.

## License

This project is maintained by and for the ALPFA NJIT chapter.
