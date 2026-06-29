# Page Schema Source Analysis

Source files inspected:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Managers/PumpkinManager.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/PageRedirectGuard.cs`
- `apps/pumpkin-api/Services/DesignSystemGuard.cs`
- `apps/pumpkin-net-models/Models/Page.cs`
- `apps/admin/src/lib/api.ts`
- `apps/admin/src/app/dashboard/pages/page.tsx`

Active route contract:

- `POST /api/admin/pages/{tenantId}` creates a page with JWT auth.
- `GET /api/admin/pages/{tenantId}/{**pageSlug}` reads a single page with JWT auth, including drafts.
- `PUT /api/admin/pages/{tenantId}/{**pageSlug}` updates a page with JWT auth.
- `GET /api/admin/pages?tenantId=...` lists pages for the authenticated tenant unless SuperAdmin.
- `GET /api/admin/tenants/{tenantId}/hubs` reads hub pages.
- `GET /api/admin/tenants/{tenantId}/content-hierarchy` reads page hierarchy.
- `GET /api/pages/{tenantId}/{**pageSlug}` reads a published page with tenant API-key auth.
- `GET /api/tenant/{tenantId}/sitemap` reads published sitemap entries with tenant API-key auth.
- `DELETE /api/pages/{tenantId}/{**pageSlug}` deletes a page with tenant API-key auth.

Tenant guard:

- Admin routes require authenticated JWT.
- Admin route tenant must match the JWT tenant unless the role is `SuperAdmin`.
- Public routes validate tenant API key against the requested tenant.

Page fields used:

- `id`
- `PageId`
- `tenantId`
- `pageSlug`
- `PageVersion`
- `Layout`
- `MetaData`
- `searchData`
- `ContentData.ContentBlocks`
- `contentRelationships`
- `seo`
- `isPublished`
- `publishedAt`
- `includeInSitemap`
- production readiness metadata containers required by the Admin UI model

Cleanup route:

No Admin delete route exists for Page. Cleanup used the source-confirmed public API-key guarded delete route.
