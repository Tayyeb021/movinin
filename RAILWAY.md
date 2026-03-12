# Deploying on Railway – login and CORS

If login returns 200 but the app does not stay logged in on Railway, use this checklist. The same token-in-header flow is used for **frontend** and **admin**; both store the token and send it in `x-access-token` and `Authorization: Bearer` on every request.

## 1. Two services (frontend + backend, or admin + backend)

You need **two** Railway services (or backend on Railway + frontend elsewhere).

### Backend service (Node/API)

In **Variables** set:

| Variable | Example | Required |
|----------|--------|----------|
| `MI_FRONTEND_HOST` | `https://your-frontend.up.railway.app` | **Yes** – must match the frontend URL in the browser (no trailing slash). |
| `MI_ADMIN_HOST` | `https://your-admin.up.railway.app` | Only if you use the admin app. |
| `MI_HTTPS` | `true` | Yes if you use cookies with SameSite=none. |
| Others | MongoDB, JWT, etc. | Per your setup. |

**Important:** `MI_FRONTEND_HOST` must be **exactly** the URL users see for the frontend (e.g. `https://web-production-abc123.up.railway.app`). If it’s wrong or missing, CORS will block requests and the frontend may not get the sign-in response (including the token).

### Frontend service (Vite/static)

In **Variables** set these **before the first build** (Vite bakes them in at build time):

| Variable | Example | Required |
|----------|--------|----------|
| `VITE_MI_API_HOST` | `https://your-backend.up.railway.app` | **Yes** – backend API URL (no trailing slash). |

If `VITE_MI_API_HOST` is missing or wrong, the frontend will call the wrong URL (or same origin) and login will fail.

### Admin service (Vite/static)

Same as frontend: set **`VITE_MI_API_HOST`** to the backend URL before the first build. The admin app uses the same token-in-header flow (token stored in sessionStorage, sent on every request).

After changing variables, **redeploy** so:
- Backend uses the new env (and returns `accessToken` in the body for both frontend and admin).
- Frontend and/or admin are **rebuilt** with the correct `VITE_MI_API_HOST` and send the token in the `x-access-token` and `Authorization: Bearer` headers.

## 2. Check in the browser

1. Open DevTools → **Network**.
2. Sign in.
3. Click the **sign-in** request:
   - **Response** body should contain `accessToken`.
   - If the body is empty or you see a CORS error, fix `MI_FRONTEND_HOST` on the backend and redeploy.
4. Click the next request (e.g. **user** or **validate-access-token**):
   - **Request Headers** should include `x-access-token` or `Authorization: Bearer ...`.
   - If they’re missing, the frontend wasn’t rebuilt with the latest code (token storage + interceptor). Redeploy the frontend with the repo that has the token-in-header flow.

## 3. Single service (frontend + backend same URL)

If you serve the API and the SPA from the same Railway service (same origin):

- You don’t need `MI_FRONTEND_HOST` for CORS.
- Set `VITE_MI_API_HOST` to the same URL (or leave it empty so the app uses the same origin).
- Cookies will work; the token-in-header flow still works as a fallback.

## 4. Summary

| Issue | Fix |
|-------|-----|
| CORS error or empty response on sign-in | Set `MI_FRONTEND_HOST` on the **backend** to the exact frontend URL and redeploy backend. |
| Frontend calls wrong URL / “undefined” | Set `VITE_MI_API_HOST` on the **frontend** and **rebuild** (redeploy). |
| 200 on sign-in but next request 403 | Redeploy **frontend** so it uses the new code that stores the token and sends it in headers. |
| Still failing | In Network tab confirm sign-in response has `accessToken` and the next request has `x-access-token` or `Authorization: Bearer`. |
