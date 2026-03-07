# Deploy: Railway (backend, frontend, admin) + APK (mobile)

**Environment variables:** See **[ENV_DEPLOYMENT.md](./ENV_DEPLOYMENT.md)** for a full list of variables for backend, frontend, admin, and mobile.

---

## 1. Deploy backend on Railway

### 1.1 Create project and connect repo

1. Go to [railway.app](https://railway.app) and sign in.
2. **New Project** → **Deploy from GitHub repo** (or GitLab) and select the `movinin` repo.
3. **Root Directory:** leave **empty** (repository root). The backend needs the `packages` folder, so it must build from repo root.
4. **Railpack:** Set variable `RAILPACK_CONFIG_FILE=railpack.backend.json` so the build runs `cd backend && npm ci` and `cd backend && npm run build`; the start command runs the backend from `backend/`.

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

Copy the rest from `backend/.env.example` and adjust for production. Full list: **[ENV_DEPLOYMENT.md](./ENV_DEPLOYMENT.md#1-backend-railway)**.

### 1.5 Port

Railway injects `PORT`. The backend uses `process.env.PORT` when set (e.g. on Railway), so you do **not** need to set `MI_PORT` for production.

### 1.6 Deploy and get URL

- Deploy the service. In **Settings** → **Networking** → **Generate Domain** to get a public URL, e.g. `https://movinin-backend.up.railway.app`.
- Note this URL as **YOUR_BACKEND_URL**; frontend, admin, and mobile all need it.

---

## 2. Deploy frontend and admin on Railway (Railpack)

**If you see `can't cd to ../packages/currency-converter`:** Railway is building only the `admin` (or `frontend`) folder. You must use the **repository root** as Root Directory so `packages/` is available. See **[RAILWAY.md](./RAILWAY.md)** for step-by-step settings.

**If you see `node: command not found` when the container starts (Frontend or Admin):** The deploy image for these services is static (Caddy + built files) and does not include Node.js. In Railway → Frontend/Admin service → **Settings** → **Start Command**, clear any custom start command (leave it empty). Railpack will use Caddy to serve the static files.

Admin and frontend depend on the monorepo `packages` folder, so **Root Directory must be the repository root** (leave empty or `.`), not `admin` or `frontend`. Use the provided Railpack configs.

### 2.1 Frontend

1. Add a **new service** for the frontend.
2. **Root directory:** leave **empty** (repo root).
3. **Start Command:** leave **empty** (do not set `npm start` or `node` — the static image uses Caddy).
4. **Variables:** set `RAILPACK_CONFIG_FILE=railpack.frontend.json` and `RAILPACK_STATIC_FILE_ROOT=frontend/build`.
5. In **Variables**, set at least:
   - `VITE_MI_API_HOST` = **YOUR_BACKEND_URL** (no trailing slash)
   - `VITE_MI_CDN_USERS` = **YOUR_BACKEND_URL**/cdn/movinin/users
   - `VITE_MI_CDN_PROPERTIES` = **YOUR_BACKEND_URL**/cdn/movinin/properties
   - `VITE_MI_CDN_LOCATIONS` = **YOUR_BACKEND_URL**/cdn/movinin/locations
6. Generate a domain for the frontend and set **backend** variable `MI_FRONTEND_HOST` = that URL with trailing slash.

Template: **frontend/.env.production.example** (replace `YOUR_BACKEND_URL`).

### 2.2 Admin

1. Add another **new service** for the admin app.
2. **Root directory:** leave **empty** (repo root).
3. **Start Command:** leave **empty** (do not set `npm start` or `node` — the static image uses Caddy).
4. **Variables:** set `RAILPACK_CONFIG_FILE=railpack.admin.json` and `RAILPACK_STATIC_FILE_ROOT=admin/build`.
5. In **Variables**, set the same `VITE_MI_API_HOST` and all `VITE_MI_CDN_*` to **YOUR_BACKEND_URL** (see **admin/.env.production.example**).
6. Generate a domain for admin and set **backend** variable `MI_ADMIN_HOST` = that URL with trailing slash.

Full variable list: **[ENV_DEPLOYMENT.md](./ENV_DEPLOYMENT.md)#2-frontend)** and **[ENV_DEPLOYMENT.md](./ENV_DEPLOYMENT.md)#3-admin)**.

---

## 3. Build Android APK (mobile)

The mobile app is **Expo** with **EAS Build**. Production Android is configured to build an **APK** in `mobile/eas.json`.

### 3.1 Point the app at your backend

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

### 3.2 Build the APK

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

### 3.3 Optional: local APK build (no EAS cloud)

```bash
cd mobile
npm run build:android:local
```

Requires Android SDK and correct environment (e.g. `ANDROID_HOME`). Still set `MI_API_HOST` in `mobile/.env` (or equivalent) so the APK talks to your Railway backend.

---

## Summary

| Goal | Action |
|------|--------|
| **Backend** | Root = repo root. `RAILPACK_CONFIG_FILE=railpack.backend.json`. Set variables from [ENV_DEPLOYMENT.md](./ENV_DEPLOYMENT.md#1-backend-railway). Generate domain → **YOUR_BACKEND_URL**. |
| **Frontend** | Root = repo root. `RAILPACK_CONFIG_FILE=railpack.frontend.json`, `RAILPACK_STATIC_FILE_ROOT=frontend/build`. Set `VITE_MI_API_HOST` and CDN URLs (see [ENV_DEPLOYMENT.md](./ENV_DEPLOYMENT.md)#2-frontend). Set `MI_FRONTEND_HOST` on backend. |
| **Admin** | Root = repo root. `RAILPACK_CONFIG_FILE=railpack.admin.json`, `RAILPACK_STATIC_FILE_ROOT=admin/build`. Set VITE vars (see [ENV_DEPLOYMENT.md](./ENV_DEPLOYMENT.md)#3-admin). Set `MI_ADMIN_HOST` on backend. |
| **APK** | Set `MI_API_HOST` to **YOUR_BACKEND_URL** (EAS env or `mobile/.env`), run `cd mobile && npm run build:android`, download APK from EAS. |

After deployment, backend, frontend, and admin use the same backend URL; the APK uses that backend for all API calls.
