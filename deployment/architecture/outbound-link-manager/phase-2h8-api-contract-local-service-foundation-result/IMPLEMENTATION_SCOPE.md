# Implementation Scope

Implemented inside:

- `deployment/architecture/outbound-link-manager/local-scanner-registry-implementation/`

Implemented local-only areas:

- API response envelope helpers.
- Error code catalog.
- Query normalization.
- Filter, sort, and pagination helpers.
- Local read-only service layer over the existing file-backed store.
- Local tenant and role guard simulation.
- Write-action guard stubs that return `OUTBOUND_LINK_WRITE_NOT_APPROVED`.
- API response validator.
- CLI commands for local API-style service calls.
- Fixtures and tests.
- Package docs.

Not implemented:

- Production Pumpkin API endpoints.
- Admin UI routes or components.
- Database migration.
- CMS writes.
- Live provider calls.
- External link crawling or live link health checks.
- Deployment, indexing, or live-page publication.

