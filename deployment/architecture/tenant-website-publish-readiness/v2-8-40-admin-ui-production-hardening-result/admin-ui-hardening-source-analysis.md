# Admin UI Hardening Source Analysis

Initial analysis found:

- Route guard existed through `ProtectedRoute`, wrapping the dashboard layout.
- Logout existed and cleared local auth, user, and tenant state.
- Tenant context display existed through the dashboard header and Pages screen.
- The deployed Admin UI did not provide `/robots.txt`.
- The deployed login page did not include Admin-wide noindex/noarchive metadata.
- Selected response security headers were absent.
- Admin API binding used the live API at runtime, but source fallback was localhost even in production if the public runtime setting was absent.

Scoped fixes made:

- Added Admin-wide noindex/noarchive metadata.
- Added generated `robots.txt` disallowing all crawlers.
- Added selected safe response headers in Next config.
- Disabled the Next powered-by header.
- Changed production fallback API base to the live Pumpkin API while preserving localhost for development.

Files changed:

- `apps/admin/next.config.js`
- `apps/admin/src/app/layout.tsx`
- `apps/admin/src/app/robots.ts`
- `apps/admin/src/lib/api.ts`

No Pumpkin API, Theme/Form, static contact, tenant, or content source was changed.

