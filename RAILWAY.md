# Railway deployment – root directory (why the build fails)

## Why `cd ../packages/currency-converter` fails

Admin and frontend **depend on the shared `packages/` folder** in this repo. Their build runs:

- `cd ../packages/currency-converter && npm i`
- and similar for `movinin-helper`, etc.

If Railway is set to use **Root Directory = `admin`** (or `frontend`), only that folder is sent to the builder. There is no `../packages` and no `railpack.admin.json` (it lives at repo root), so:

- `cd ../packages/...` fails with **"can't cd to ../packages/currency-converter"**
- Railpack uses the default plan (no custom config), so it never runs `cd admin && npm ci`

So **all three services (backend, frontend, admin) must use the repository root**, not a subfolder.

---

## What to set in Railway

For **each** service (Admin, Frontend, Backend):

1. Open the service in Railway.
2. Go to **Settings** (or the service’s settings tab).
3. Find **Root Directory** (under “Build” or “Source”).
4. **Clear it** or set it to **`.`** so the **whole repo** is the build context.
5. Save.

Then set the variables below so Railpack uses the right config and (for static apps) the right output folder.

| Service   | Root Directory | Variables |
|----------|----------------|-----------|
| **Backend**  | *(empty or `.`)* | `RAILPACK_CONFIG_FILE=railpack.backend.json` |
| **Frontend** | *(empty or `.`)* | `RAILPACK_CONFIG_FILE=railpack.frontend.json`, `RAILPACK_STATIC_FILE_ROOT=frontend/build` |
| **Admin**    | *(empty or `.`)* | `RAILPACK_CONFIG_FILE=railpack.admin.json`, `RAILPACK_STATIC_FILE_ROOT=admin/build` |

After that, redeploy. The build will see the full repo, `packages/` will exist, and the Railpack config will run `cd admin && npm ci` / `cd admin && npm run build` (and the same idea for frontend/backend).

Full steps and env vars: see **[DEPLOY.md](./DEPLOY.md)**.
