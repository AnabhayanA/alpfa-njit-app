require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
const { Readable } = require('stream');

const PORT = process.env.PORT || 8080;
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID;
const UPLOAD_API_KEY = process.env.UPLOAD_API_KEY;

if (!DRIVE_FOLDER_ID) {
  console.error('Missing DRIVE_FOLDER_ID environment variable.');
  process.exit(1);
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
app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (_req, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowed.includes(file.mimetype)) {
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

app.post('/upload', requireApiKey, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo included in the request.' });
  }

  try {
    const fileMetadata = {
      name: `alpfa-njit-${Date.now()}.jpg`,
      parents: [DRIVE_FOLDER_ID],
    };
    const media = {
      mimeType: req.file.mimetype,
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

// Multer errors (e.g. file too large, wrong type) land here instead of crashing the process.
app.use((error, _req, res, _next) => {
  if (error) {
    return res.status(400).json({ error: error.message || 'Upload failed.' });
  }
  res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(PORT, () => {
  console.log(`ALPFA NJIT photo upload server listening on port ${PORT}`);
});
