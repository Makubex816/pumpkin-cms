# Pumpkin Active Endpoint Contract V2.8.36

Date: 2026-06-29

Source: operator-provided embedded `API_ENDPOINTS.md` contract from the V2.8.36 approval text. No repo-local `API_ENDPOINTS.md` was found.

## Active Public Endpoints

- `GET /`: welcome, no auth.
- `GET /api/pages/{tenantId}/{**pageSlug}`: published page read, API key auth.
- `POST /api/pages/{tenantId}`: create page, API key auth. Not exercised in V2.8.36.
- `PUT /api/pages/{tenantId}/{**pageSlug}`: update page, API key auth. Not exercised in V2.8.36.
- `DELETE /api/pages/{tenantId}/{**pageSlug}`: delete page, API key auth. Not exercised in V2.8.36.
- `GET /api/tenant/{tenantId}/sitemap`: published sitemap source, API key auth.

## Active Auth/Admin Endpoints

- `POST /api/auth/login`: body shape is `{ email, password }`; returns JWT and user tenant/role context.
- `GET /api/auth/verify`: validates JWT and returns current user context.
- `POST /api/auth/logout`: stateless logout acknowledgement.
- `GET /api/admin/tenants`: SuperAdmin sees all, non-SuperAdmin sees own tenant.
- `GET /api/admin/tenants/{tenantId}`: SuperAdmin only.
- `POST /api/admin/tenants`: SuperAdmin only. Not exercised in V2.8.36.
- `PUT /api/admin/tenants/{tenantId}`: SuperAdmin only. Not exercised in V2.8.36.
- `POST /api/admin/tenants/{tenantId}/regenerate-api-key`: SuperAdmin only. Not exercised in V2.8.36.
- `DELETE /api/admin/tenants/{tenantId}`: SuperAdmin only and cannot delete own tenant. Not exercised in V2.8.36.

## Active Page/Content Endpoints

- `GET /api/admin/pages`: tenant-scoped page list, optional SuperAdmin `tenantId` query.
- `GET /api/admin/pages/{tenantId}/{**pageSlug}`: tenant-scoped draft/published page read.
- `POST /api/admin/pages/{tenantId}`: tenant-scoped page create. Not exercised in V2.8.36.
- `PUT /api/admin/pages/{tenantId}/{**pageSlug}`: tenant-scoped page update. Not exercised in V2.8.36.
- `GET /api/admin/tenants/{tenantId}/hubs`: tenant-scoped hub pages.
- `GET /api/admin/tenants/{tenantId}/hubs/{hubPageSlug}/spokes`: tenant-scoped spokes for a hub.
- `GET /api/admin/tenants/{tenantId}/content-hierarchy`: tenant-scoped hierarchy view.

## Active Operational Content Endpoints

- `GET /api/admin/{tenantId}/media-assets`: tenant-scoped media metadata list.
- `GET /api/admin/{tenantId}/media-assets/{id}`: tenant-scoped media metadata read.
- `POST /api/admin/{tenantId}/media-assets`: tenant-scoped media metadata registration. Not exercised in V2.8.36.
- `POST /api/admin/{tenantId}/media-assets/upload`: tenant-scoped media upload. Not exercised in V2.8.36.
- `PATCH /api/admin/{tenantId}/media-assets/{id}`: tenant-scoped metadata update. Not exercised in V2.8.36.
- `GET /api/admin/{tenantId}/publish-runs`: tenant-scoped publish/build history list.
- `GET /api/admin/{tenantId}/publish-runs/{id}`: tenant-scoped publish/build history read.
- `POST /api/admin/{tenantId}/publish-runs`: tenant-scoped dry-run/build history write. Not exercised in V2.8.36.
- `GET /api/admin/{tenantId}/import-runs`: tenant-scoped import history list.
- `GET /api/admin/{tenantId}/import-runs/{id}`: tenant-scoped import history read.
- `POST /api/admin/{tenantId}/import-runs`: tenant-scoped import history write. Not exercised in V2.8.36.

## No-Regression Only

- `POST /api/forms/{tenantId}/entries`: completed through prior contact gate proof.
- `GET /api/admin/{tenantId}/form-entries`: completed through prior Admin readback proof.
- `GET /api/admin/{tenantId}/form-entries/{id}`: reference only.
- `PATCH /api/admin/{tenantId}/form-entries/{id}`: out of active V2.8.36 scope.

## Explicit Exclusions

- Theme endpoints are excluded from V2.8.36 implementation and validation.
- Form Definition endpoints are excluded from V2.8.36 implementation and validation.
- No Theme, FormDefinition, or forms container was approved for creation.
