# ALPFA NJIT App

Student-developed mobile app for the ALPFA chapter at NJIT.

- [`frontend/`](frontend/) — Expo / React Native app, screens, assets, iOS native code, and development configuration.
- [`backend/`](backend/) — legacy upload server source and backend notes. The production Cloudflare Worker source is not part of this repository.

## Run the mobile app

```bash
cd frontend
npm ci
npx expo start --clear
```

See [`frontend/README.md`](frontend/README.md) for more.

Never commit production secrets.
