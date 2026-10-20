# Frontend (Expo / React Native)

The mobile app currently runs from the repository root, not this folder. The active entry point is `index.ts`, with `App.tsx`, `screens/`, `components/`, `assets/`, `constants/`, `utils/`, and `modules/` at the root.

**Run the app from the repository root:**

```bash
npm install
npx expo start --clear
```

Do not move Expo files here until Metro, TypeScript, asset paths, native modules, EAS configuration, and CI are updated and verified on iOS. This directory documents the intended frontend boundary without breaking existing builds.
