# ALPFA NJIT architecture and cleanup plan

## Current verified layout

- **Mobile frontend:** Expo SDK 57 / React Native / TypeScript at repository root (`App.tsx`, `index.ts`, `screens/`, `components/`, `assets/`, `constants/`, `utils/`, `modules/`).
- **Backend:** separately deployed Cloudflare Worker for calendar and Drive uploads; source not yet identified in this repository.
- **Testing:** Expo Go for UI checks; production iOS builds use the existing Expo/EAS configuration.

## Target organization

```text
frontend/   Expo application, once entry points/configuration are migrated safely
backend/    Real Cloudflare Worker source, when recovered
 docs/      Architecture, testing and maintenance notes
```

## Safe migration checklist

1. Obtain and review the actual Worker source; do not invent a backend.
2. Move the Expo project into `frontend/` in a dedicated PR, updating asset imports, `package.json`, lockfile, Expo/EAS paths, native module linking, TypeScript and CI references.
3. Run install, TypeScript, Expo Doctor, Metro, and Expo Go smoke tests on both themes, navigation, camera, Google Calendar and uploads.
4. Delete files only after verifying they are unreferenced, not required by build tooling or native projects, and recoverable from Git history.
5. Merge only after CI and device checks pass. Do not commit secrets.

**Current status:** directories and documentation prepared; no runtime paths moved and no source files deleted.
