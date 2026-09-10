# ALPFA NJIT Photo Upload Server

A tiny Express server that receives photos from the app's in-app camera and
uploads them into a Google Drive folder owned by/shared with the ALPFA NJIT
Google account. This exists because a mobile app can never safely hold the
Google credentials needed to write to Drive — they'd be extractable from the
app bundle. This server keeps those credentials on a machine only you control.

## 1. Create a Google Cloud service account

1. Go to https://console.cloud.google.com/ and sign in (any Google account,
   doesn't have to be the ALPFA email — you're just creating a small robot
   identity that will be granted access to one Drive folder).
2. Create a new project (top bar → "New Project"), e.g. `alpfa-njit-uploads`.
3. In the search bar, open **APIs & Services → Library**, search for
   **Google Drive API**, and click **Enable**.
4. Go to **APIs & Services → Credentials → Create Credentials → Service account**.
   - Name it something like `alpfa-photo-uploader`.
   - Skip granting it project roles (not needed) and click **Done**.
5. Click into the new service account → **Keys** tab → **Add Key → Create new key → JSON**.
   This downloads a `.json` file — keep it secret, never commit it to git.
6. Note the service account's email address, it looks like
   `alpfa-photo-uploader@your-project.iam.gserviceaccount.com`.

## 2. Share a Drive folder with the service account

1. In the ALPFA NJIT Google account's Google Drive, create a folder, e.g.
   "App Photo Submissions".
2. Right-click it → **Share** → paste the service account email from step 1.6
   → give it **Editor** access → Send (uncheck "notify people" if it complains
   about the address not being a real inbox).
3. Open the folder and copy its ID from the URL:
   `https://drive.google.com/drive/folders/<THIS_PART_IS_THE_FOLDER_ID>`

## 3. Configure the server

```sh
cd server
npm install
cp .env.example .env
```

Edit `.env`:
- `DRIVE_FOLDER_ID` — the folder ID from step 2.3.
- `GOOGLE_SERVICE_ACCOUNT_JSON` — open the downloaded JSON key file and paste
  its entire contents as one line (or base64-encode it with
  `base64 -i key.json | tr -d '\n'` if your host's env var UI doesn't like
  raw JSON/newlines).
- `UPLOAD_API_KEY` — make up a random string (e.g. from
  `openssl rand -hex 24`). **Required before any public/production
  deployment** — without it, the /upload endpoint is open to anyone who
  finds the URL. It's not bulletproof since it ships inside the app bundle,
  but combined with rate limiting it stops casual abuse.
- `ALLOWED_ORIGINS` — leave blank unless you ship a web build; see the
  Security section below.

Run it locally to test:

```sh
npm start
```

Test with curl:

```sh
curl -X POST http://localhost:8080/upload \
  -H "x-api-key: <your UPLOAD_API_KEY>" \
  -F "photo=@/path/to/test.jpg"
```

You should see the photo appear in the Drive folder.

## 4. Deploy it somewhere it stays running

Any small Node host works. Render's free web service tier is the easiest:

1. Push this `server/` folder to a git repo (or the whole app repo — Render
   lets you set a "Root Directory").
2. https://render.com → **New → Web Service** → connect the repo.
3. Root directory: `server`. Build command: `npm install`. Start command: `npm start`.
4. Add the three environment variables from your `.env` file in Render's
   dashboard (Environment tab) — never commit `.env` itself.
5. Deploy. Render gives you a URL like `https://alpfa-photo-upload.onrender.com`.

(Railway, Fly.io, or a small VPS work the same way — just make sure the three
env vars are set and the process stays running.)

## 5. Point the app at it

In the Expo app, edit `constants/config.ts`:

```ts
export const PHOTO_UPLOAD_ENDPOINT = 'https://alpfa-photo-upload.onrender.com/upload';
```

If you set `UPLOAD_API_KEY`, also add it to `utils/driveUpload.ts`'s fetch
headers (`'x-api-key': '<the same value>'`) — ask if you'd like this wired up
via an Expo public env variable instead of hardcoding it.

## Security

This endpoint is publicly reachable, so it's built with a few layers of
defense instead of relying on any single one:

- **`UPLOAD_API_KEY`** — a shared secret required in the `x-api-key` header.
  Set this before shipping publicly (see step 3).
- **Rate limiting** — each IP is capped at 20 upload attempts per 15 minutes
  (`express-rate-limit`), regardless of whether the API key is valid, so a
  leaked key or brute-force attempt can't spam the Drive folder or run up
  Google API usage.
- **Real content-type checking** — the client-supplied MIME type is checked
  first, then the actual file bytes are sniffed with `file-type` after
  upload and rejected if they don't match an allowed image format. This
  stops someone from renaming an arbitrary file to `photo.jpg` and uploading
  it as if it were an image.
- **Size/count limits** — 15 MB max, one file per request (`multer`).
- **`helmet`** — sets standard security response headers.
- **CORS allowlist** — only relevant if/when this app ships a web build;
  set `ALLOWED_ORIGINS` to that origin. Native apps aren't affected by CORS.
- **No secrets in the client** — Google credentials only ever live in this
  server's environment variables, never in the Expo app bundle.
- **No stack traces returned** — errors are logged server-side and only a
  generic message is sent to the client.

Things intentionally left out for now (revisit before a wider public launch):
- No per-user accounts/authentication — anyone with the app + API key can
  upload. Fine for a chapter-only tool; would need real auth for anything
  more sensitive.
- No virus/malware scanning of uploaded images.
- No admin/audit log of who uploaded what.
