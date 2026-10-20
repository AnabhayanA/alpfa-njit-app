# ALPFA NJIT — Native iOS

This folder is the native SwiftUI migration of the ALPFA NJIT app. The existing Expo app remains in the repository while the native version is tested for feature parity. Android can later move to its own repository without constraining the iOS architecture.

## Requirements

- macOS with Xcode 16 or newer
- iOS 17 deployment target
- [XcodeGen](https://github.com/yonaskolb/XcodeGen): `brew install xcodegen`
- An Apple Developer team for device builds, push notifications, and App Store distribution

## Open the project

```bash
cd ios-native
xcodegen generate
open ALPFANJIT.xcodeproj
```

Choose your signing team and a physical iPhone, then Run. The permanent chapter logo is stored as `ALPFANJITLogo` in the asset catalog and should not be substituted or redrawn.

## Implemented in the first migration milestone

- SwiftUI app lifecycle and native tab/navigation structure
- cinematic ALPFA-branded launch animation with bottom progress line
- live Google Calendar ICS feed, offline cache, pull-to-refresh, event list, and event details
- redesigned dynamic Next Event home banner
- local event reminders and notification settings entry
- native E-Board flip cards and About page
- native AVFoundation camera capture and existing backend-compatible multipart upload service
- safe-area-aware, iPhone-first layout

## Configuration before distribution

1. Replace the calendar URL in `CalendarStore.swift` only if the chapter's public feed changes.
2. Add `PHOTO_UPLOAD_ENDPOINT` to the target's Info settings via a non-secret build configuration. Google/service-account credentials must remain on the backend.
3. Add final App Store icon renditions to an `AppIcon.appiconset` and set `ASSETCATALOG_COMPILER_APPICON_NAME` to `AppIcon`.
4. Change the push entitlement from `development` to the distribution value through Xcode signing for release builds.
5. Add a small authenticated officer API before enabling remote announcement blasts. Officer credentials and push-provider secrets must never ship inside the app.

## Migration safety

Do not remove the Expo project until native iPhone testing confirms calendar parsing, reminders, camera/upload behavior, accessibility, deep links, and App Store signing. The previous iOS MultiCam work will be ported into `CameraController` as the camera milestone; this first native screen uses the stable rear-camera capture path.
