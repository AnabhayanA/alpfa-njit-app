require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { fromBuffer: fileTypeFromBuffer } = require('file-type');
const { google } = require('googleapis');
const { Readable } = require('stream');

const PORT = process.env.PORT || 8080;
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID;
const UPLOAD_API_KEY = process.env.UPLOAD_API_KEY;
// Comma-separated list of allowed web origins, e.g. "https://alpfa-njit.app,http://localhost:3000".
// Leave unset to allow any origin (fine for a native-only app; set this once there's a web build).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);

if (!DRIVE_FOLDER_ID) {
  console.error('Missing DRIVE_FOLDER_ID environment variable.');
  process.exit(1);
}

if (!UPLOAD_API_KEY) {
  console.warn(
    'WARNING: UPLOAD_API_KEY is not set. The /upload endpoint is open to anyone who finds its URL. ' +
    'Set UPLOAD_API_KEY before deploying publicly.'
  );
}

function loadServiceAccountCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error('Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable.');
    process.exit(1);
  }
  // Support both raw JSON and base64-encoded JSON (base64 is easier to paste into some hosts' env UIs).
  const looksLikeJson = raw.trim().startsWith('{');
  const jsonString = looksLikeJson ? raw : Buffer.from(raw, 'base64').toString('utf8');
  return JSON.parse(jsonString);
}

const credentials = loadServiceAccountCredentials();
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});
const drive = google.drive({ version: 'v3', auth });

const app = express();
// Needed so express-rate-limit sees the real client IP behind a host's reverse proxy (Render, Railway, etc).
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors(
    ALLOWED_ORIGINS.length > 0
      ? { origin: ALLOWED_ORIGINS }
      : {} // no origin restriction configured yet
  )
);

// Blunt but effective abuse guard: caps how many uploads a single IP can
// attempt in a window, regardless of whether they have a valid API key.
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many uploads from this device. Please try again later.' },
});

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 }, // 15 MB, one file per request
  fileFilter: (_req, file, callback) => {
    // This only checks the client-supplied Content-Type, which can be spoofed;
    // the real check happens after upload by sniffing the file's magic bytes.
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return callback(new Error('Only image uploads are allowed.'));
    }
    callback(null, true);
  },
});

function requireApiKey(req, res, next) {
  if (!UPLOAD_API_KEY) return next(); // no key configured, skip check
  if (req.header('x-api-key') !== UPLOAD_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/upload', uploadLimiter, requireApiKey, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo included in the request.' });
  }

  // Verify the actual file content matches an allowed image type — a
  // forged Content-Type header alone would otherwise slip past multer's
  // fileFilter (OWASP: unrestricted file upload).
  const detected = await fileTypeFromBuffer(req.file.buffer).catch(() => null);
  if (!detected || !ALLOWED_IMAGE_TYPES.has(detected.mime)) {
    return res.status(400).json({ error: 'File content does not match an allowed image type.' });
  }

  try {
    const fileMetadata = {
      name: `alpfa-njit-${Date.now()}.${detected.ext}`,
      parents: [DRIVE_FOLDER_ID],
    };
    const media = {
      mimeType: detected.mime,
      body: Readable.from(req.file.buffer),
    };

    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id',
    });

    return res.json({ success: true, fileId: driveResponse.data.id });
  } catch (error) {
    console.error('Drive upload failed:', error);
    return res.status(502).json({ error: 'Failed to upload photo to Google Drive.' });
  }
});

// Multer/other request errors (e.g. file too large, wrong type) land here
// instead of crashing the process or leaking a stack trace to the client.
app.use((error, _req, res, _next) => {
  if (error) {
    console.warn('Request error:', error.message);
    return res.status(400).json({ error: error.message || 'Upload failed.' });
  }
  res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(PORT, () => {
  console.log(`ALPFA NJIT photo upload server listening on port ${PORT}`);
});

