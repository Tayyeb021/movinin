# Vendor tarballs

`movinin-types-1.0.0.tgz` is the packed `packages/movinin-types` package. The backend depends on it via `"movinin-types": "file:./vendor/movinin-types-1.0.0.tgz"` so the backend can be built and deployed without the full monorepo.

**To refresh the tarball** when you change `packages/movinin-types`:

```bash
cd packages/movinin-types
npm run build
npm pack --pack-destination ../../backend/vendor
```

This overwrites `backend/vendor/movinin-types-1.0.0.tgz`. Then run `npm install` in `backend` to update the linked package.
