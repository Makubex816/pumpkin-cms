# CMS Read-Only Boundaries

## Allowed In Phase 2C-6

Only these CMS/API methods were allowed:

- GET
- HEAD

Only these CMS/API purposes were allowed:

- identify whether a Roller tenant shell already exists
- identify whether a Roller site shell or domain record already exists
- identify existing Roller routes/pages that could conflict with import
- identify conflicting slug, site, or domain records
- identify form-recipient reference conflicts if a read-only endpoint exists

## Forbidden In Phase 2C-6

- POST
- PUT
- PATCH
- DELETE
- tenant creation
- content import
- CMS mutation
- MediaAsset writes
- static generation
- deployment
- Azure, Cloudflare, DNS, or Function App changes
- email or Microsoft 365 work
- Search Console, sitemap submission, URL Inspection, or indexing
- protected config reads
- secret printing
- live-page publication

## Actual CMS/API Calls

No CMS/API calls were made.

Reason: `PUMPKIN_API_URL` was missing, so there was no approved API target. The presence of `PUMPKIN_ADMIN_JWT` alone was not enough to proceed.

## Known Read-Only Endpoints From Source Review

The API source exposes these read-only endpoints that a later approved preflight can use when required env is present:

- `GET /api/admin/tenants`
- `GET /api/admin/tenants/{tenantId}`
- `GET /api/admin/pages?tenantId={tenantId}`
- `GET /api/admin/pages/{tenantId}/{pageSlug}`
- `GET /api/admin/{tenantId}/import-runs`
- `GET /api/admin/{tenantId}/media-assets`
- `GET /api/admin/themes/{tenantId}`

The source review also found no dedicated implemented CMS import preflight checker. A future checker should wrap the safe GET/HEAD calls and produce redacted conflict evidence.
