# Auth / login when frontend and backend are on different hosts

If sign-in returns **200 OK** on the server but the user is not actually logged in (e.g. next request fails or UI doesn’t show as logged in), the auth **cookie is not being sent** on later requests.

## Cause

When the frontend (e.g. Vercel) and backend (e.g. Railway) are on **different origins**, the browser only sends cookies on cross-origin requests if the cookie was set with **`SameSite=None`** and **`Secure=true`**. The default is `SameSite=strict`, so the cookie is set by the backend but never sent on the next request (e.g. `getUser`), and the backend responds with 403 "No token provided!".

## Fix: set these on the **backend** (server)

In your backend environment (Railway, etc.), set:

| Variable | Value | Notes |
|----------|--------|--------|
| `MI_COOKIE_SAME_SITE` | `none` | Required for cross-origin; cookie will be sent with requests from the frontend to the backend. |
| `MI_HTTPS` | `true` | Required when `SameSite=none` (browsers require `Secure` cookies). |
| `MI_AUTH_COOKIE_DOMAIN` | *(empty)* | Leave unset or empty so the cookie is set for the backend host only. |
| `MI_FRONTEND_HOST` | `https://your-frontend-domain.com` | Exact origin of the frontend (no trailing slash). Required for CORS. |
| `MI_ADMIN_HOST` | `https://your-admin-domain.com` | If you use the admin app on a separate host. |

After changing these, redeploy the backend. The frontend must already be using `withCredentials: true` (it does in this project) and the backend must allow credentials in CORS (it does).

## Summary

- **Same origin (e.g. both on localhost):** default `MI_COOKIE_SAME_SITE=strict` is fine.
- **Different origins (e.g. Vercel + Railway):** set `MI_COOKIE_SAME_SITE=none`, `MI_HTTPS=true`, and leave `MI_AUTH_COOKIE_DOMAIN` empty.
