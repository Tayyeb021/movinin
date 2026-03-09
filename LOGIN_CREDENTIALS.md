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

- **Admin** and **Agency** use the **admin** app.
- **User** and **Tenant** use the **frontend** (public) app.

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

2. **Check Railway (or host) logs:** After the change above, the backend logs a reason for sign-in failure, e.g.:
   - `[user.signin] 204: user not found` → run setup or ensure the user exists in the production DB.
   - `[user.signin] 204: password mismatch` → use password `M00vinin` (or whatever you set when running setup).

3. **Set `MI_ADMIN_EMAIL` in production** if you use a custom admin email; the setup script uses it to create the admin user.
