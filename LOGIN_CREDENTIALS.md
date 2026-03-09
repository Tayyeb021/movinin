# Bakali – Login credentials (demo users)

Default password for all demo users: **`M00vinin`**

These users are created when you run the backend setup:  
`cd backend && npm run setup`

| User type | Email | Where to log in |
|-----------|--------|------------------|
| **Admin** | `admin@movinin.io` | Admin app (e.g. http://localhost:3003) |
| **Agency** (property manager) | `agency@movinin.io` | Admin app |
| **User** (customer) | `user@movinin.io` | Frontend (e.g. http://localhost:3004) |
| **Tenant** (BTMS tenant) | `tenant@movinin.io` | Frontend (“My tenancy” / tenant dashboard) |

- **Admin** and **Agency** must use the **admin app URL** (e.g. `https://your-admin.up.railway.app`). If you open the frontend site and sign in with admin/agency email, login will be rejected.
- **User** and **Tenant** must use the **frontend (public) app URL**.

To (re)create these users, run from the project root:

```bash
cd backend
npm run setup
```

Admin email can be changed via `MI_ADMIN_EMAIL` in `backend/.env`.

---

## "Incorrect email or password" in production (e.g. Railway)

If login works locally but fails in production with "Incorrect email or password", the **production database** usually does not have the demo users (or they have a different password).

1. **Create/reset users in production:** Run the backend setup against your **production** MongoDB (e.g. from your machine or a one-off script):
   ```bash
   cd backend
   # Set MI_DB_URI to your production MongoDB connection string
   npm run setup
   ```
   Or set `MI_DB_URI` in `backend/.env` to the production URI, run `npm run setup`, then switch back to local if needed.

2. **Check Railway (or host) logs:** After deploying, each sign-in attempt logs a line. Look for:
   - `[user.signin] attempt type=ADMIN email=age***` → request reached the backend; then one of:
   - `[user.signin] 200 OK type=ADMIN userId=...` → login succeeded; cookie was set.
   - `[user.signin] 204: user not found` → run setup or ensure the user exists in the production DB.
   - `[user.signin] 204: password mismatch` → use password `M00vinin` (or whatever you set when running setup).
   - `[user.signin] 204: invalid or missing app type` → frontend/admin are calling the wrong sign-in URL.
   - `[user.signin] 204: body.email missing` → request body not JSON or not sent; check `Content-Type: application/json`.

3. **Cookie fix (production):** The backend sets the auth cookie from the sign-in URL (`/api/sign-in/Admin` vs `/api/sign-in/Frontend`). For **cross-origin** (admin/frontend on a different host than the backend, e.g. Railway), set in the **backend** service:
   - `MI_COOKIE_SAME_SITE=none` — so the browser sends the cookie on cross-origin requests.
   - `MI_AUTH_COOKIE_DOMAIN=` (empty) — so the cookie is scoped to the backend host.
   - Keep `MI_ADMIN_HOST` and `MI_FRONTEND_HOST` set to your admin and frontend app URLs for CORS.

4. **Set `MI_ADMIN_EMAIL` in production** if you use a custom admin email; the setup script uses it to create the admin user.
