# Security Boundaries

Phase 2H-3 stays local/offline.

Allowed:

- read fixture JSON inside this package;
- write scan output under package `.tmp`;
- run Node tests;
- validate generated local JSON.

Not allowed:

- database migration;
- CMS writes;
- MediaAsset writes;
- CMS/API calls;
- Admin UI implementation;
- Pumpkin API implementation;
- production renderer integration;
- external HTTP crawling;
- link health checks;
- protected config reads;
- secret access;
- Azure, Cloudflare, DNS, deployment, indexing, or publication mutations.

The source test suite checks for external HTTP client and protected config read patterns.
