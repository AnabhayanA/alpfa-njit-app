# Repository structure

- `frontend/` contains the Expo / React Native app and an independent native iOS prototype. Run Expo commands from `frontend/`.
- `backend/server/` contains an older Express upload server implementation.
- The production Cloudflare Worker is deployed separately; its source is not included here.

Moving files into folders does not change a running backend deployment. Backend credentials must stay in a secret store, never in a public repository.
