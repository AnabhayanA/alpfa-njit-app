# Backend (Cloudflare Worker)

The deployed ALPFA NJIT backend is a Cloudflare Worker. The mobile app uses it for Google Calendar requests and Google Drive photo uploads.

**Backend source has not been imported into this repository.** This directory is a placeholder for the actual Worker project once its source repository or Cloudflare dashboard export is available. Do not add fake endpoints or credentials.

The production client endpoint is configured in `constants/config.ts`. Never commit Google OAuth credentials, service-account keys, access tokens, or `.env` secrets. The student-submission photo folder is private; any public gallery must use a separate approved source and optimized thumbnails.
