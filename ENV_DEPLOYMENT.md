# Environment variables for deployment

Use this as a checklist when deploying backend, frontend, and admin (e.g. Railway, Vercel).

**Placeholders:**
- `YOUR_BACKEND_URL` = backend public URL (e.g. `https://movinin-backend.up.railway.app`)
- `YOUR_ADMIN_URL` = admin app URL (e.g. `https://movinin-admin.up.railway.app` or Vercel URL)
- `YOUR_FRONTEND_URL` = frontend app URL (e.g. `https://movinin.up.railway.app` or Vercel URL)

---

## 1. Backend (Railway)

Set in Railway → your backend service → **Variables**. No trailing slashes for URLs unless noted.

| Variable | Required | Example / note |
|----------|----------|-----------------|
| `NODE_ENV` | Yes | `production` |
| `MI_DB_URI` | Yes | MongoDB URI (Atlas or Railway MongoDB) |
| `MI_JWT_SECRET` | Yes | Strong random string |
| `MI_COOKIE_SECRET` | Yes | Strong random string |
| `MI_ADMIN_HOST` | Yes | `YOUR_ADMIN_URL/` (trailing slash) |
| `MI_FRONTEND_HOST` | Yes | `YOUR_FRONTEND_URL/` (trailing slash) |
| `MI_SMTP_HOST` | Yes | e.g. `smtp.sendgrid.net` |
| `MI_SMTP_PORT` | Yes | `587` |
| `MI_SMTP_USER` | Yes | SMTP user |
| `MI_SMTP_PASS` | Yes | SMTP password |
| `MI_SMTP_FROM` | Yes | e.g. `no-reply@yourdomain.com` |
| `MI_CDN_ROOT` | Yes | e.g. `/app/cdn` or volume path |
| `MI_CDN_USERS` | Yes | e.g. `/app/cdn/movinin/users` |
| `MI_CDN_TEMP_USERS` | Yes | e.g. `/app/cdn/movinin/temp/users` |
| `MI_CDN_PROPERTIES` | Yes | e.g. `/app/cdn/movinin/properties` |
| `MI_CDN_TEMP_PROPERTIES` | Yes | e.g. `/app/cdn/movinin/temp/properties` |
| `MI_CDN_LOCATIONS` | Yes | e.g. `/app/cdn/movinin/locations` |
| `MI_CDN_TEMP_LOCATIONS` | Yes | e.g. `/app/cdn/movinin/temp/locations` |
| `MI_PORT` | No | Railway sets `PORT`; backend reads it automatically |
| `MI_HTTPS` | No | `true` in production if you terminate SSL |
| `MI_AUTH_COOKIE_DOMAIN` | No | Your cookie domain or leave default |
| `MI_DEFAULT_LANGUAGE` | No | `en` |
| `MI_ADMIN_EMAIL` | No | `admin@movinin.io` (for setup) |
| `MI_WEBSITE_NAME` | No | `Bakali` |
| Others | No | See `backend/.env.example` (Stripe, PayPal, Sentry, etc.) |

---

## 2. Frontend (Railway / Vercel / Netlify)

Set in your frontend service **Environment Variables**. Build-time: all `VITE_*` are baked into the build.

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_MI_API_HOST` | Yes | `YOUR_BACKEND_URL` (no trailing slash) |
| `VITE_MI_CDN_USERS` | Yes | `YOUR_BACKEND_URL/cdn/movinin/users` |
| `VITE_MI_CDN_PROPERTIES` | Yes | `YOUR_BACKEND_URL/cdn/movinin/properties` |
| `VITE_MI_CDN_LOCATIONS` | Yes | `YOUR_BACKEND_URL/cdn/movinin/locations` |
| Others | No | See `frontend/.env.production.example` |

**Quick copy:** Use `frontend/.env.production.example` and replace `YOUR_BACKEND_URL` with your backend URL.

---

## 3. Admin (Railway / Vercel / Netlify)

Set in your admin service **Environment Variables**.

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_MI_API_HOST` | Yes | `YOUR_BACKEND_URL` (no trailing slash) |
| `VITE_MI_CDN_USERS` | Yes | `YOUR_BACKEND_URL/cdn/movinin/users` |
| `VITE_MI_CDN_TEMP_USERS` | Yes | `YOUR_BACKEND_URL/cdn/movinin/temp/users` |
| `VITE_MI_CDN_PROPERTIES` | Yes | `YOUR_BACKEND_URL/cdn/movinin/properties` |
| `VITE_MI_CDN_TEMP_PROPERTIES` | Yes | `YOUR_BACKEND_URL/cdn/movinin/temp/properties` |
| `VITE_MI_CDN_LOCATIONS` | Yes | `YOUR_BACKEND_URL/cdn/movinin/locations` |
| `VITE_MI_CDN_TEMP_LOCATIONS` | Yes | `YOUR_BACKEND_URL/cdn/movinin/temp/locations` |
| Others | No | See `admin/.env.production.example` |

**Quick copy:** Use `admin/.env.production.example` and replace `YOUR_BACKEND_URL` with your backend URL.

---

## 4. Mobile (EAS / APK)

For production APK, set in **Expo EAS** → Project → Environment variables (or in `mobile/.env` for local build, do not commit secrets).

| Variable | Required | Example |
|----------|----------|---------|
| `MI_API_HOST` | Yes | `YOUR_BACKEND_URL` (no trailing slash) |
| `MI_CDN_USERS` | No | `YOUR_BACKEND_URL/cdn/movinin/users` |
| `MI_CDN_PROPERTIES` | No | `YOUR_BACKEND_URL/cdn/movinin/properties` |

---

## Order of deployment

1. Deploy **backend** first → get `YOUR_BACKEND_URL`.
2. Set **backend** variables: `MI_ADMIN_HOST`, `MI_FRONTEND_HOST`, DB, SMTP, CDN paths.
3. Deploy **frontend** and **admin** with `VITE_MI_API_HOST` and CDN URLs pointing to `YOUR_BACKEND_URL`.
4. Run backend setup if needed: one-off command or `start:setup` in Docker (creates admin user, etc.).
