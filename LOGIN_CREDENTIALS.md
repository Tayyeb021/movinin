# Movin' In – Login credentials (demo users)

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
