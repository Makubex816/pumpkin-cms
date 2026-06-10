# Non Goals

This phase does not approve:

- Pumpkin API implementation.
- Admin UI implementation.
- Database migration or schema migration execution.
- CMS writes.
- MediaAsset writes.
- POST, PUT, PATCH, or DELETE requests against CMS/API services.
- Production renderer integration.
- Runtime switch to Outbound Link Manager rendering controls.
- External link crawling.
- Live HTTP checks of outbound URLs.
- Azure, Cloudflare, DNS, Cosmos, or Storage mutations.
- Deployment.
- Search Console or indexing work.
- Live-page publication.
- Protected config reads.
- Credential, key, cookie, bearer credential, JWT, connection string, or SAS access.
- Electron implementation.
- Repo cleanup or remediation.

Any future write-capable behavior must be approved in a later phase with explicit tenant scope, backup readiness, audit requirements, preview output, conflict handling, and rollback documentation.

