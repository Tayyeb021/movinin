# Deploy: Railway (backend) + APK (mobile)

## 1. Deploy backend on Railway

### 1.1 Create project and connect repo

1. Go to [railway.app](https://railway.app) and sign in.
2. **New Project** → **Deploy from GitHub repo** (or GitLab) and select the `movinin` repo.
3. Railway will detect the Dockerfile. The repo has **railway.json** at the root that points to `backend/Dockerfile`; the build runs from the **repository root** so the Dockerfile’s `COPY ./backend` and `COPY ./packages` work.

### 1.2 Root directory

- Leave **Root Directory** empty (or `/`) so the build context is the whole repo.
- If Railway asks for a Dockerfile path, set **RAILWAY_DOCKERFILE_PATH** = `backend/Dockerfile` (or it will use `railway.json`).

### 1.3 Database (MongoDB)

- Either add **MongoDB** from Railway’s “New” → “Database” and use the generated `MONGO_URL` (or similar),  
- Or use **MongoDB Atlas**: create a cluster and get a connection string.

Set in Railway **Variables**:

- `MI_DB_URI` = your MongoDB URI (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/movinin?retryWrites=true&w=majority` or Railway’s `MONGO_URL`).

### 1.4 Backend environment variables

In the Railway service **Variables**, add the same variables as in `backend/.env.example`. At minimum:

| Variable | Example / note |
|----------|-----------------|
| `NODE_ENV` | `production` |
| `MI_PORT` | `4004` (Railway often sets `PORT`; backend may need to read `process.env.PORT` or you set `MI_PORT` = Railway’s `PORT`) |
| `MI_DB_URI` | Your MongoDB connection string |
| `MI_JWT_SECRET` | Strong random string |
| `MI_COOKIE_SECRET` | Strong random string |
| `MI_ADMIN_HOST` | Your admin app URL, e.g. `https://your-admin.vercel.app/` |
| `MI_FRONTEND_HOST` | Your frontend URL, e.g. `https://your-frontend.vercel.app/` |
| `MI_SMTP_HOST`, `MI_SMTP_PORT`, `MI_SMTP_USER`, `MI_SMTP_PASS`, `MI_SMTP_FROM` | SMTP for emails |
| `MI_CDN_*` | File storage paths; for Railway you may use a volume or external storage (S3, etc.) and set these accordingly |

Copy the rest from `backend/.env.example` and adjust for production.

### 1.5 Port

Railway injects `PORT`. The backend uses `process.env.PORT` when set (e.g. on Railway), so you do **not** need to set `MI_PORT` for production.

### 1.6 Deploy and get URL

- Deploy the service. In **Settings** → **Networking** → **Generate Domain** to get a public URL, e.g. `https://movinin-backend.up.railway.app`.
- Note this URL; the mobile app will use it as `MI_API_HOST`.

---

## 2. Build Android APK (mobile)

The mobile app is **Expo** with **EAS Build**. Production Android is configured to build an **APK** in `mobile/eas.json`.

### 2.1 Point the app at your backend

The app uses `MI_API_HOST` from `mobile/.env` (via `@env`). For the **production** APK you must use your **Railway backend URL**.

**Option A – EAS environment variables (recommended)**

1. Install EAS CLI: `npm i -g eas-cli`
2. Log in: `eas login`
3. In [expo.dev](https://expo.dev) → your project → **Build** → **Environment variables** (or use `eas env:create`), add:
   - `MI_API_HOST` = `https://your-backend.up.railway.app` (no trailing slash; use your real Railway URL)

**Option B – Local .env for build**

In `mobile/.env` set:

```env
MI_API_HOST=https://your-backend.up.railway.app
```

Then run the build (see below). Do not commit real production URLs if the repo is public; use EAS env instead.

### 2.2 Build the APK

From the **repository root** or from **mobile**:

```bash
cd mobile
npm run build:android
```

Or with EAS directly:

```bash
cd mobile
eas build --profile production --platform android
```

This uses the **production** profile in `mobile/eas.json`, which has `"buildType": "apk"`, so the artifact is an **APK**.

- After the build finishes, download the APK from the link in the terminal or from [expo.dev](https://expo.dev) → your project → **Builds**.
- Install the APK on a device or emulator; the app will call your Railway backend using `MI_API_HOST`.

### 2.3 Optional: local APK build (no EAS cloud)

```bash
cd mobile
npm run build:android:local
```

Requires Android SDK and correct environment (e.g. `ANDROID_HOME`). Still set `MI_API_HOST` in `mobile/.env` (or equivalent) so the APK talks to your Railway backend.

---

## Summary

| Goal | Action |
|------|--------|
| **Backend on Railway** | Connect repo, leave root as repo root, set `railway.json` / Dockerfile path to `backend/Dockerfile`, add MongoDB + all `MI_*` (and port) variables, deploy, generate domain. |
| **APK** | Set `MI_API_HOST` to Railway backend URL (EAS env or `mobile/.env`), run `cd mobile && npm run build:android` (or `eas build --profile production --platform android`), download APK from EAS. |

After deployment, your backend runs on Railway and the APK uses that backend for all API calls.
