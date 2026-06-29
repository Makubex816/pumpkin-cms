# Pumpkin Tenant Website Publish Readiness V2.8.38 Admin UI Page Content CRUD Proof Report

Date: 2026-06-29

## Phase Status

V2.8.38 is complete.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness

Classification: `controlled_page_crud_public_sitemap_proof_cleanup_succeeded`

This phase proved one tenant-scoped synthetic Page/content record can be created, read, updated, publicly read through the API-key route, excluded from sitemap when `includeInSitemap=false`, and cleaned up from the live Pumpkin API.

## V2.8.37A Carryforward

V2.8.37A left the Admin UI live on both default Azure App Service hosts and proved live Admin API read-only auth. The tenant container was ready but unseeded:

- Admin UI isolated and production default hosts returned HTTP 200 for `/` and `/login`.
- Admin API login returned HTTP 200.
- Role was `TenantAdmin`.
- Expected tenant was visible.
- Page count was 0.
- Hub count was 0.
- Content hierarchy total pages was 0.
- Prior readiness classification was `container_ready_no_content_seeded`.

## Secure Auth Readiness

Approved owner hard-copy:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\v2-8-34a-corrected-key-rotation\ROTATED_VALUES_OPERATOR_HARD_COPY.txt`

The file existed and the SHA-256 matched the approved hash. Admin login values and the tenant API key were read into process memory only. No secret value, password, API key, token, cookie, connection string, or hard-copy contents were printed or written.

No `.tmp/v2-8-38/secure` working file was created.

## Page Schema And Payload

Source inspection confirmed the active Page contract and routes:

- Admin create: `POST /api/admin/pages/{tenantId}`.
- Admin read: `GET /api/admin/pages/{tenantId}/{**pageSlug}`.
- Admin update: `PUT /api/admin/pages/{tenantId}/{**pageSlug}`.
- Public read: `GET /api/pages/{tenantId}/{**pageSlug}`.
- Sitemap read: `GET /api/tenant/{tenantId}/sitemap`.
- Cleanup delete: `DELETE /api/pages/{tenantId}/{**pageSlug}`.

The Admin routes enforce JWT tenant scope. Public read/sitemap/delete require the tenant API key. Public read returns only `isPublished=true` pages. Sitemap returns only pages where `isPublished=true` and `includeInSitemap=true`.

Synthetic proof record:

- Trace ID: `v2-8-38-page-content-proof-20260629201535-1023d4`.
- Tenant ID: `ice-rink-rentals`.
- Slug: `pumpkin-proof-v2-8-38-page-content-proof-20260629201535-1023d4`.
- Create title: `Pumpkin V2.8.38 Page Content Proof`.
- Updated title: `Pumpkin V2.8.38 Page Content Proof Updated`.
- `isPublished=true`.
- `includeInSitemap=false`.
- `ContentData.ContentBlocks=[]`.
- No Theme/FormDefinition/FormEntry/media/upload content was used.

## Pre-Mutation Readiness

- Login: HTTP 200.
- Token received: true, not printed.
- Role: `TenantAdmin`.
- Tenant matched expected tenant: true.
- `GET /api/admin/tenants`: HTTP 200.
- Tenant count: 1.
- Expected tenant visible: true.
- `GET /api/admin/pages?tenantId=ice-rink-rentals`: HTTP 200.
- Page count before proof: 0.
- Synthetic slug pre-read: HTTP 404.

## Create Read Update Proof

Create:

- Route: `POST /api/admin/pages/ice-rink-rentals`.
- Attempts: 1.
- Status: HTTP 201.
- Returned slug matched the synthetic slug.
- Returned title matched the create title.
- Returned `isPublished=true`.
- Returned `includeInSitemap=false`.

Admin read after create:

- Status: HTTP 200.
- Slug matched.
- Title matched.
- Tenant matched.
- `isPublished=true`.
- `includeInSitemap=false`.

Update:

- Route: `PUT /api/admin/pages/ice-rink-rentals/{slug}`.
- Attempts: 1.
- Status: HTTP 200.
- Returned title matched the updated title.
- Returned version: 2.
- Returned `isPublished=true`.
- Returned `includeInSitemap=false`.

Admin read after update:

- Status: HTTP 200.
- Slug matched.
- Updated title matched.
- Tenant matched.
- Version: 2.

## Public Hierarchy Sitemap Proof

Content hierarchy and hubs:

- `GET /api/admin/tenants/ice-rink-rentals/hubs`: HTTP 200.
- Hub count: 0.
- `GET /api/admin/tenants/ice-rink-rentals/content-hierarchy`: HTTP 200.
- Total pages during proof: 1.
- Proof slug was present in the hierarchy body while the record existed.

Public page read:

- `GET /api/pages/ice-rink-rentals/{slug}` using tenant API-key auth returned HTTP 200.
- Slug matched.
- Updated title matched.
- `isPublished=true`.
- `includeInSitemap=false`.

Sitemap read:

- `GET /api/tenant/ice-rink-rentals/sitemap` using tenant API-key auth returned HTTP 200.
- Sitemap entry count: 0.
- Proof slug present: false.
- Expected exclusion because `includeInSitemap=false`: true.

## Cleanup Result

Cleanup:

- Route: `DELETE /api/pages/ice-rink-rentals/{slug}` with tenant API key.
- Attempts: 1.
- Status: HTTP 204.

Final verification:

- Admin read after cleanup: HTTP 404.
- Public read after cleanup: HTTP 404.
- Admin pages read after cleanup: HTTP 200.
- Page count after cleanup: 0.

No residual synthetic proof page remains visible through the tested Admin or public API routes.

## Tenant Scope Proof

- All write/read routes used `tenantId=ice-rink-rentals`.
- Admin JWT role was `TenantAdmin`.
- Admin JWT tenant matched `ice-rink-rentals`.
- Tenant count was 1.
- The created page tenant matched `ice-rink-rentals`.
- No other tenant was queried or mutated.

## Admin UI Implications

The live Pumpkin API endpoints used by the Admin UI page client were proven end to end for the Page lifecycle surface. V2.8.38 did not perform browser-driven UI form entry; it proved the backend/API route contract used by the live Admin UI source.

## Contact And FormEntry

Contact/FormEntry remained no-regression only. No contact POST, form submission, Theme work, FormDefinition work, or FormEntry mutation was performed.

## Guardrails

- No deploy or redeploy occurred.
- No Azure resource creation/deletion occurred.
- No appsetting mutation occurred.
- No DNS/custom-domain mutation occurred.
- No indexing tooling action occurred.
- No contact POST occurred.
- No Theme/FormDefinition work occurred.
- No media upload occurred.
- No tenant create/update/delete occurred.
- No writes occurred outside the one synthetic Page proof record.
- No `.tmp` secure file was staged.
- No hard-copy file was staged.
- No broad staging command was used.

## Files

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-38-admin-ui-page-content-crud-proof-result/`

Key files:

- `result-manifest.json`
- `page-schema-source-analysis.md`
- `pre-mutation-admin-readiness.md`
- `page-create-result.md`
- `page-update-result.md`
- `cleanup-or-revert-result.md`
- `validation-summary.md`
- `next-phase-prompt.md`

## Next Phase

The exact next approval request is folded into `next-phase-prompt.md`: seed or import real tenant content under a separate explicit write approval, with pre-approved payloads and cleanup/rollback boundaries.
