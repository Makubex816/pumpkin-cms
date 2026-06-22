# Hybrid Recovery Option

Recommended path if no exact old artifact is found:

1. Treat the current three-route source as the route/control baseline.
2. Restore or rebuild image-rich content and assets from owner-approved sources.
3. Keep the current technical fixes for public payload cleanup, sitemap/canonical alignment, static form wiring, and route generation.
4. Deploy the rebuilt artifact to `swa-ice-static-isolated-staging` first.
5. Require owner visual/content approval before production.
6. Require a separate production-bound deploy approval before touching `swa-ice-static-staging`.

This path avoids a blind rollback while still recovering the public customer-facing experience.

