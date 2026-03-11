# Auth / login when frontend and backend are on different hosts

**Deploying on Railway?** See **[RAILWAY.md](../RAILWAY.md)** in the project root for a step-by-step checklist (env vars, CORS, and token-in-header).

## Recommended: token in header (no cookie dependency)

The app supports **two** auth methods so login works even when cookies are blocked or misconfigured:

1. **Cookie** – backend sets an httpOnly cookie (requires correct SameSite/domain on cross-origin).
2. **Token in header** – backend returns `accessToken` in the sign-in response body; the frontend stores it and sends it in the **`x-access-token`** header on every request. This works reliably across origins.

The backend **always returns `accessToken` in the response body** for web sign-in and social sign-in. The frontend **stores it in sessionStorage** and the axios client **sends it in the `x-access-token` header** for all API requests. The auth middleware accepts **either** the header or the cookie. So **no extra server configuration is required** for cross-origin login when using this flow.

---

## If you still use cookies only

If sign-in returns **200 OK** but the user is not logged in and you are not using the token header, the auth **cookie** may not be sent on later requests.

## Cookie-based auth (optional)

If you want cookie-based auth to work as well, set in your backend environment:

| Variable | Value | Notes |
|----------|--------|--------|
| `MI_FRONTEND_HOST` | `https://your-frontend-domain.com` | Exact origin of the frontend (no trailing slash). Required for CORS. |
| `MI_HTTPS` | `true` | Required when sameSite is `none`. |
| `MI_AUTH_COOKIE_DOMAIN` | *(empty)* | Leave unset so the cookie is for the backend host only. |
| `MI_ADMIN_HOST` | `https://your-admin-domain.com` | If you use the admin app on a separate host. |
| `MI_COOKIE_SAME_SITE` | `none` (or leave unset when MI_FRONTEND_HOST is set) | So the cookie is sent cross-origin. |

The frontend sends **both** the cookie (when present) and the **`x-access-token`** header when it has a token; the backend accepts either. Token-in-header is the most reliable for cross-origin and does not depend on cookie configuration.

## Check server logs

On startup the backend logs the auth cookie config, for example:

```
Auth cookie: sameSite=none, domain=(not set), secure=true
```

- If you see `sameSite=strict` and you have a separate frontend host, set `MI_FRONTEND_HOST` (or `MI_ADMIN_HOST`); the backend then defaults sameSite to `none`. Or set `MI_COOKIE_SAME_SITE=none` explicitly.
- If you see `domain=localhost` and the server is not localhost, **unset** `MI_AUTH_COOKIE_DOMAIN` or set it to empty.

## Summary

- **Same origin (e.g. both on localhost):** default `MI_COOKIE_SAME_SITE=strict` is fine.
- **Different origins (e.g. Vercel + Railway):** set `MI_COOKIE_SAME_SITE=none`, `MI_HTTPS=true`, and leave `MI_AUTH_COOKIE_DOMAIN` unset or empty.
