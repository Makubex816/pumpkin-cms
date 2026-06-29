# Next Phase Prompt

Continue with the next approved Pumpkin multi-tenant readiness phase.

Scope:

1. Use the V2.8.36 durable contracts:
   - `deployment/architecture/pumpkin-platform/PUMPKIN_MULTI_TENANT_PLATFORM_CONTRACT.md`
   - `deployment/architecture/pumpkin-platform/PUMPKIN_ACTIVE_ENDPOINT_CONTRACT_V2_8_36.md`
   - `deployment/architecture/pumpkin-platform/PUMPKIN_FUTURE_PHASE_MULTITENANCY_GATE.md`
2. Run authenticated read-only Pumpkin API proof only with an approved secure source that contains Admin credentials and tenant API key values.
3. Do not print or write any secret, password, key, token, cookie, or connection string value.
4. Verify:
   - `GET /api/admin/tenants`
   - `GET /api/admin/pages?tenantId=ice-rink-rentals`
   - `GET /api/admin/tenants/ice-rink-rentals/content-hierarchy`
   - `GET /api/admin/ice-rink-rentals/media-assets`
   - `GET /api/admin/ice-rink-rentals/publish-runs`
   - `GET /api/admin/ice-rink-rentals/import-runs`
   - `GET /api/tenant/ice-rink-rentals/sitemap`
5. Do not write page, media, import-run, publish-run, tenant, user, Theme, Form Definition, or FormEntry documents.
6. Do not deploy Admin UI unless separately approved.
7. Keep Themes and Form Definitions excluded unless explicitly approved.
8. Produce a read-only proof report and update the roadmap.

Hard stops:

- No deploy without explicit deploy approval.
- No contact POST.
- No appsetting mutation.
- No DNS/custom-domain mutation.
- No indexing.
- No protected config reads.
- No broad git staging.
