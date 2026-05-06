# Authentication and local development environment

This checklist prevents "registration works but user missing", "activate link crashes", and CORS/cookie issues when the **admin** (e.g. port 3003), **frontend** (e.g. port 3004 or 5173), and **API** (e.g. port 4004) run on different origins.

## 1. URL alignment (required)

| Variable | Must match |
|----------|------------|
| `MI_ADMIN_HOST` | Exact **Origin** in the browser when you use the admin app (scheme + host + port + trailing slash as in [backend/.env.example](../backend/.env.example), e.g. `http://localhost:3003/`). |
| `MI_FRONTEND_HOST` | Exact **Origin** when you use the public frontend (e.g. `http://localhost:3004/` or your Vite port). |
| `VITE_MI_API_HOST` (admin + frontend) | Base URL of the API, e.g. `http://localhost:4004` (no trailing path). |

The backend uses these for CORS and for building **activation** and **password** links in emails.

## 2. Cross-origin cookies (JWT in cookie)

If the SPA and API are on **different hosts or ports**, the browser treats them as cross-site.

- Default `MI_COOKIE_SAME_SITE=strict` sends cookies only in same-site requests. For SPA on `localhost:3004` calling API on `localhost:4004`, that often **blocks** auth cookies.
- For local dev with separate ports, set `MI_COOKIE_SAME_SITE=lax` or `none` (with `MI_HTTPS=true` in production when using `none`).
- Ensure `axios` / `fetch` uses `withCredentials: true` for routes that rely on cookies (already used in this project).

## 3. SMTP and signup

User signup creates a user then sends an activation email. If **SMTP fails**, the backend **deletes** the new user so the account will not exist.

- Configure `MI_SMTP_*` in `.env`.
- If email is not configured, use **admin "Create user"** or database seeding for test accounts.

## 4. Activation links

Activation URLs are built from `MI_FRONTEND_HOST` or `MI_ADMIN_HOST` depending on user type. If the link opens the wrong host/port, activation will fail or show an empty page.

After changing ports, update `.env` and restart the backend.

## 5. Google-related env (clarification)

- **Google Analytics**: `VITE_MI_GOOGLE_ANALYTICS_*` on the frontend — invalid IDs do not affect login; disable analytics if not used.
- **Booking emails** may include a plain **Google Maps** URL (`maps.google.com?q=lat,lng`) — no Maps JavaScript API key is required for that link.
