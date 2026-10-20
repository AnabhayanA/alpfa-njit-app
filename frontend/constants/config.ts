// Production Cloudflare Worker endpoint that receives photos and uploads them
// to the ALPFA NJIT Google Drive.
export const PHOTO_UPLOAD_ENDPOINT =
  'https://alpfa-njit-backend.alpfanjit.workers.dev/upload';

// Optional app-level API key. Google OAuth credentials stay on the backend
// and must never be included in the Expo client.
export const PHOTO_UPLOAD_API_KEY =
  process.env.EXPO_PUBLIC_UPLOAD_API_KEY || '';
