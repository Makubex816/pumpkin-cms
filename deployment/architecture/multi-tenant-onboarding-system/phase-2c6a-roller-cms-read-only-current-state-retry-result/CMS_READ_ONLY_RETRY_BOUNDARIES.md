# CMS Read-Only Retry Boundaries

## Allowed Methods

- GET
- HEAD

## Forbidden Methods

- POST
- PUT
- PATCH
- DELETE

## Allowed Purpose

The retry could have checked, if env readiness allowed:

- existing Roller tenant shell
- existing Roller site shell
- existing `rollerrinkrentals.com` domain/site mapping
- existing approved routes
- existing forbidden route conflicts
- existing form recipient reference conflicts
- existing records that would affect a future CMS import

## Actual CMS/API Calls

No CMS/API calls were made.

Reason: `PUMPKIN_API_URL` was missing, so there was no approved API target.

## Safe Read-Only Endpoint Inventory From Source

The source scan found these existing GET endpoints that a future retry can use after env readiness:

- `GET /api/admin/tenants`
- `GET /api/admin/tenants/{tenantId}`
- `GET /api/admin/pages?tenantId={tenantId}`
- `GET /api/admin/pages/{tenantId}/{pageSlug}`
- `GET /api/admin/{tenantId}/form-entries`
- `GET /api/admin/{tenantId}/import-runs`
- `GET /api/admin/{tenantId}/media-assets`
- `GET /api/admin/themes/{tenantId}`
- `GET /api/pages/{tenantId}/{pageSlug}`
- `GET /api/tenant/{tenantId}/sitemap`
- `GET /api/themes/{tenantId}`

Any future evidence command must summarize only redacted counts/statuses and must not print raw payloads, auth headers, API keys, JWTs, cookies, or private customer data.
