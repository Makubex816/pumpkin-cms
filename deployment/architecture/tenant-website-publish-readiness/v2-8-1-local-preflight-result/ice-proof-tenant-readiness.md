# Ice Proof Tenant Readiness

IceSkatingRinkRentals.com is the active proof tenant.

| Check | Result | Evidence |
| --- | --- | --- |
| Site config exists | passed | `apps/ice-rink-web/src/config/sites.ts` |
| Static mode exists | passed | `PUMPKIN_RENDER_MODE=static`, `SITE_KEY=ice-rink-rentals` |
| Local type-check | passed | `npm run type-check` |
| Static build | passed with warnings and caveat | `npm run build:static:ice`; Next auto-detected `.env.local`, so the build proof is caveated |
| Seed-site static validation | failed | missing `service-areas`, obsolete Ice slugs present |
| Static output validation | failed | missing `service-areas/index.html`, obsolete route output, static form endpoint verification missing |
| Historical CMS-backed static proof | passed historically | `deployment/azure/ice-static-form-production-enablement-result/` |

Readiness decision: Ice is not ready for deployment, DNS change, indexing, or live publication from the current safe local seed-site path.

Exact blockers:

- Refresh or replace current safe local Ice static source with approved `home`, `contact`, and `service-areas` pages.
- Remove obsolete deployable route output for `/ice-rink-rentals` and `/events-holiday-activations`.
- Run static export through a sanitized path that does not auto-load protected local config.
- Reverify static form endpoint state in an approved local/session contract without reading protected config.
- Keep deployment, DNS, indexing, and live publication closed until a later explicit approval.
