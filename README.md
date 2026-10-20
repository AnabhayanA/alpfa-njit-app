# ALPFA NJIT Mobile App

A student-developed mobile experience for the Association of Latino Professionals For America chapter at New Jersey Institute of Technology.

## Features

- **Home:** chapter updates, upcoming events, ALPFA Moments preview, and quick links.
- **Events:** event information and optional calendar reminders.
- **E-Board:** chapter leadership profiles and professional connections.
- **Capture:** take or select photos, apply filters, and share chapter memories.
- **About:** chapter information, membership resources, and contact links.
- **Accessibility and design:** responsive navigation, light and dark themes.

The ALPFA Moments public photo gallery is under development; photos will be displayed only after approval.

## Technology

Built with React Native, Expo, TypeScript, React Navigation, and Expo camera and media libraries. The application communicates with managed services for events and photo submissions.

## Getting started

Requirements: Node.js LTS, npm, and Expo Go for supported development features.

```bash
npm install
npx expo start --clear
```

Native iOS-only features require an appropriate development build and compatible hardware.

## Privacy and security

The app requests camera, photo-library, location, or notification permissions only when needed for the associated feature. Location sharing is optional.

Credentials, production configuration, service-account details, administrative procedures, and deployment secrets are intentionally excluded from public documentation. **Never commit secrets to this repository.** A public mobile app cannot keep embedded API keys secret.

Report potential security issues privately to the project maintainers rather than posting credentials or exploit details in a public issue.

## Project status

This project is under active development and testing. Some features, including the public ALPFA Moments gallery, are not yet complete.

## Maintainers

Developed for the ALPFA NJIT chapter.
