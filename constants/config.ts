// URL of the small backend that receives photos and uploads them to the
// ALPFA NJIT Google Drive. Deploy the project in /server and paste its URL
// here (e.g. "https://alpfa-njit-photo-upload.onrender.com").
export const PHOTO_UPLOAD_ENDPOINT = 'https://REPLACE-WITH-YOUR-BACKEND-URL.example.com/upload';

// Optional shared secret matching the backend's UPLOAD_API_KEY env var.
// Set via an EXPO_PUBLIC_ env variable so it isn't hardcoded in source control.
export const PHOTO_UPLOAD_API_KEY = process.env.EXPO_PUBLIC_UPLOAD_API_KEY || '';
