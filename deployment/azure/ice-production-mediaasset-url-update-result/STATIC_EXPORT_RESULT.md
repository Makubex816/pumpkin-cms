# Static Export Result

Date: 2026-06-05

## Result

Ice static export was not rerun in this blocked attempt.

Reason:

```text
The approved MediaAsset update was blocked before write/readback by HTTP 401 admin auth.
```

The requested command was therefore not run:

```text
cd apps/ice-rink-web
npm run export:static:ice:cms
```

No generated static artifacts were staged.

## Expected Follow-Up

After a fresh valid admin JWT is available and the 9 MediaAsset records are updated/read back, rerun:

```text
cd apps/ice-rink-web
npm run export:static:ice:cms
```

Expected route scope remains:

- snapshot slugs: `contact`, `home`, `service-areas`
- out routes: `/`, `/contact`, `/service-areas`
- copied artifact routes: `/`, `/contact`, `/service-areas`
- preview/obsolete deployable paths: `0`
