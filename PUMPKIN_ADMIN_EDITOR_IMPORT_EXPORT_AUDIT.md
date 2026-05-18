# Pumpkin Admin Editor Import/Export Audit

## Executive Summary

Pumpkin CMS already has the foundation for a real multi-site rental-site editor:

- `apps/admin` has login, protected dashboard routes, tenant selection, page listing, a structured page editor, block editing fields, theme editing, tenant management, page-map visualization, and icon browsing.
- `apps/pumpkin-api` has JWT login, tenant-scoped admin page create/read/update endpoints, public API-key content endpoints, form submission, theme endpoints, sitemap endpoints, and tenant management endpoints.
- Shared page and block models exist in both `.NET` and TypeScript packages.
- `apps/ice-rink-web` can render CMS-backed pages for both `ice-rink-rentals` and `roller-rink-rentals`.
- The local seed/import tool can validate and upsert known tenant/theme/page JSON into Cosmos Emulator.

The missing piece is not the first editor screen. The missing piece is a safe editorial workflow around that screen: verification/logout alignment, direct page-read support in the admin client, publish/archive semantics, revisions, preview, import/export jobs, validation/diff tooling, and a clear source-of-truth strategy for live Cosmos content versus offline JSON page builds.

Recommended source of truth for the MVP: keep Cosmos as the live content source for admin-edited pages, and treat JSON files as portable export/import/staging artifacts. Add an optional offline JSON runtime fallback later, but do not let Cosmos and JSON both become independent live sources without a strict precedence rule.

## Audit Scope

Reviewed:

- `apps/admin`
- `apps/pumpkin-api`
- `apps/pumpkin-net-models`
- `packages/pumpkin-ts-models`
- `packages/pumpkin-block-views`
- `apps/ice-rink-web`
- `tools/ice-rink-local-seed`
- existing root project reports

This was a report-only audit. No source code, `.env.local`, `appsettings.Development.json`, or production data was modified.

## Confirmed Current State

Existing reports and repo state support this baseline:

- Ice Rink tenant works locally.
- Roller Rink tenant works locally.
- CMS-backed pages render through Pumpkin API and Cosmos.
- Contact submissions save to `FormEntry`.
- Local seed/import tooling works for known local tenant seed folders.
- Roller Rink Rentals has replaced the old second-site placeholder.
- The next product need is a real admin workflow for editing, importing, exporting, previewing, validating, and safely publishing rental-site pages.

## What Already Exists

### Admin Routes And Screens

Current `apps/admin` routes:

| Route | Current status |
| --- | --- |
| `/` | Redirects authenticated users to `/dashboard`, others to `/login`. |
| `/login` | Login form posts to `apiClient.login()`. |
| `/dashboard` | Protected stats dashboard; stats are calculated client-side from pages. |
| `/dashboard/pages` | Tenant-scoped page list with status, slug, title, type, updated date. |
| `/dashboard/pages/[id]` | Structured page editor for new and existing pages. |
| `/dashboard/page-map` | Tenant-scoped hub/spoke visualization using React Flow and Dagre. |
| `/dashboard/themes` | Theme list with edit/delete actions. |
| `/dashboard/themes/[id]` | Theme editor for general, header, footer, block styles, and menu. |
| `/dashboard/tenants` | SuperAdmin tenant manager with create/edit/delete/API-key regeneration. |
| `/dashboard/icons` | Lucide icon browser for block icon names. |

### Admin Capability Matrix

| Capability | Exists now? | Notes |
| --- | --- | --- |
| Login screen | Yes | UI and API call exist. |
| Login backend | Yes | `POST /api/auth/login` validates a User record and returns JWT. |
| Login verified in this audit | Not runtime-verified | Code path exists; runtime success depends on an active seeded user and JWT config. |
| Auth verify | Client expects it; API missing | `apiClient.verifyToken()` calls `/api/auth/verify`, but no backend route exists. |
| Logout | Client expects it; API missing | `apiClient.logout()` calls `/api/auth/logout`, but no backend route exists. Client clears local storage anyway. |
| Protected routes | Yes | `ProtectedRoute` guards dashboard pages. |
| Tenant selection | Yes | `TenantSelector` uses `/api/admin/tenants`; SuperAdmin sees all, others see own tenant. |
| Page listing | Yes | `/dashboard/pages` uses `/api/admin/pages?tenantId=...`. |
| Page get/read | Partial | Backend has direct admin get-by-slug. Admin client currently lists pages and filters client-side. |
| Page editing | Yes | Structured form edits base fields, metadata, search data, SEO, relationships, and content blocks. |
| Page create | Yes | `/dashboard/pages/new` calls admin create endpoint. |
| Page duplicate | Block-level only | Blocks can be duplicated. Whole-page duplicate is missing. |
| Page delete | Missing in admin workflow | Public API-key delete exists, but no admin page delete/archive UI or admin delete endpoint. |
| Publish/unpublish | Partial | Editor toggles `isPublished` and saves full page. No dedicated publish endpoint, approval, or revision snapshot. |
| Archive | Missing | No model field or endpoint for archive. |
| Preview | Missing | JSON preview exists, but not a rendered page preview. |
| Theme editing | Yes | Theme list/editor supports header, footer, menu, active flag, and block styles JSON. |
| Block editing | Yes | Structured editors exist for known block types, with add/remove/reorder/duplicate. No drag/drop required. |
| SEO editing | Yes | Meta title/description, keywords, robots, canonical, Open Graph, Twitter, and structured data editor exist. |
| Import/export | Missing in admin | Local seed tool exists, but admin import/export workflows do not. |
| Form entry admin | Missing | Public form submit exists; no admin list/export/search for entries. |

## Existing API Endpoint Inventory

### Authentication

| Endpoint | Status | Purpose |
| --- | --- | --- |
| `POST /api/auth/login` | Present | Email/password login, returns JWT and user info. |
| `GET /api/auth/verify` | Missing | Admin client calls it, but backend does not define it. |
| `POST /api/auth/logout` | Missing | Admin client calls it, but backend does not define it. |

### Public Content/API-Key Endpoints

These use tenant API key auth through `Authorization: Bearer ...`.

| Endpoint | Status | Purpose |
| --- | --- | --- |
| `GET /api/pages/{tenantId}/{**pageSlug}` | Present | Gets a published page only. |
| `POST /api/pages/{tenantId}` | Present | Creates a page with tenant API key. |
| `PUT /api/pages/{tenantId}/{**pageSlug}` | Present | Updates a page with tenant API key. |
| `DELETE /api/pages/{tenantId}/{**pageSlug}` | Present | Hard-deletes a page with tenant API key. |
| `POST /api/forms/{tenantId}/entries` | Present | Saves a form entry to `FormEntry`. |
| `GET /api/tenant/{tenantId}/sitemap` | Present | Returns published sitemap entries where `includeInSitemap=true`. |
| `GET /api/themes/{tenantId}` | Present | Gets active theme for tenant. |
| `GET /api/themes/{tenantId}/{themeId}` | Present | Gets specific theme. |

Important safety note: public API-key create/update/delete page endpoints exist. Admin editing should prefer JWT admin endpoints and should not depend on browser-exposed tenant API keys.

### Admin Tenant Endpoints

These use JWT auth.

| Endpoint | Status | Purpose |
| --- | --- | --- |
| `GET /api/admin/tenants` | Present | Gets tenants available to authenticated user. |
| `GET /api/admin/tenants/{tenantId}` | Present | Gets specific tenant, SuperAdmin only. |
| `POST /api/admin/tenants` | Present | Creates tenant, SuperAdmin only. |
| `PUT /api/admin/tenants/{tenantId}` | Present | Updates tenant, SuperAdmin only. |
| `POST /api/admin/tenants/{tenantId}/regenerate-api-key` | Present | Regenerates tenant API key, SuperAdmin only. |
| `DELETE /api/admin/tenants/{tenantId}` | Present | Deletes tenant, SuperAdmin only, blocks deleting own tenant. |

### Admin Page Endpoints

These use JWT auth.

| Endpoint | Status | Purpose |
| --- | --- | --- |
| `GET /api/admin/pages?tenantId=...` | Present | Lists pages for selected tenant. |
| `GET /api/admin/pages/{tenantId}/{**pageSlug}` | Present | Gets one page, including drafts. |
| `POST /api/admin/pages/{tenantId}` | Present | Creates one page. |
| `PUT /api/admin/pages/{tenantId}/{**pageSlug}` | Present | Updates one page. |
| `DELETE /api/admin/pages/{tenantId}/{**pageSlug}` | Missing | Needed for admin hard delete, though archive should come first. |
| `POST /api/admin/pages/{tenantId}/{pageSlug}/publish` | Missing | Recommended dedicated publish endpoint. |
| `POST /api/admin/pages/{tenantId}/{pageSlug}/unpublish` | Missing | Recommended dedicated unpublish endpoint. |
| `POST /api/admin/pages/{tenantId}/{pageSlug}/archive` | Missing | Recommended dedicated archive endpoint. |
| `POST /api/admin/pages/{tenantId}/{pageSlug}/duplicate` | Missing | Recommended duplicate endpoint. |
| `POST /api/admin/pages/{tenantId}/{pageSlug}/preview` | Missing | Optional server-side preview/session endpoint. |

### Admin Page Map / Relationships

| Endpoint | Status | Purpose |
| --- | --- | --- |
| `GET /api/admin/tenants/{tenantId}/hubs` | Present | Lists hub pages. |
| `GET /api/admin/tenants/{tenantId}/hubs/{hubPageSlug}/spokes` | Present | Lists spokes for a hub. |
| `GET /api/admin/tenants/{tenantId}/content-hierarchy` | Present | Gets hierarchy visualization data. |

### Admin Theme Endpoints

| Endpoint | Status | Purpose |
| --- | --- | --- |
| `GET /api/admin/themes/{tenantId}` | Present | Lists themes. |
| `GET /api/admin/themes/{tenantId}/active` | Present | Gets active theme. |
| `GET /api/admin/themes/{tenantId}/{themeId}` | Present | Gets one theme. |
| `POST /api/admin/themes/{tenantId}` | Present | Creates theme. |
| `PUT /api/admin/themes/{tenantId}/{themeId}` | Present | Updates theme. |
| `DELETE /api/admin/themes/{tenantId}/{themeId}` | Present | Deletes theme. |

### Forms

| Endpoint | Status | Purpose |
| --- | --- | --- |
| `POST /api/forms/{tenantId}/entries` | Present | Public tenant-key form submission. |
| `GET /api/admin/forms/{tenantId}/entries` | Missing | Needed for admin form-entry list/export. |
| `GET /api/admin/forms/{tenantId}/entries/{entryId}` | Missing | Needed for detail view. |
| Form export endpoints | Missing | Needed later for CSV/JSON lead export. |

### Sitemap

| Endpoint | Status | Purpose |
| --- | --- | --- |
| `GET /api/tenant/{tenantId}/sitemap` | Present | API sitemap data. |
| `GET /sitemap.xml` in `apps/ice-rink-web` | Present | Next route renders XML for resolved site. |

### Documentation/API Spec Gap

`apps/pumpkin-api/api.json` appears stale. It does not inventory the current admin/auth/theme endpoints, and its `structuredData` schema differs from the current `.NET` and TypeScript models, which use a string array. The implementation should regenerate OpenAPI after endpoint cleanup.

## What Is Missing

The MVP admin/editor system still needs:

- Backend auth verify/logout alignment.
- Admin client `getPage()` to use direct admin get endpoint instead of list/filter.
- Dedicated publish/unpublish/archive/duplicate endpoints or clearly defined full-page update semantics.
- Admin page delete endpoint only after archive exists.
- Revisions and rollback.
- Rendered preview using the same `PageRenderer` and theme resolution as the live frontend.
- Import/export admin screens.
- Import jobs, dry-run, diff, validation, and downloadable logs.
- Export bundles that exclude secrets by default.
- Offline JSON page build mode and a clear precedence rule versus Cosmos.
- Admin form-entry list/export.
- Better validation for slugs, canonicals, tenant scoping, block fields, image fields, structured data, and sitemap rules.
- Cross-tenant duplicate-content guardrails for multi-domain rental-site expansion.

## Proposed MVP Admin UI Screens

### 1. Login

Purpose:

- Authenticate a user with email/password.
- Store JWT.
- Redirect to tenant/site selection or dashboard.

Required fixes:

- Add or remove backend verify/logout behavior so the client and API agree.
- Avoid requiring any browser-exposed tenant API key for JWT-only admin requests.

### 2. Tenant/Site Selector

Purpose:

- Show available tenant/site records.
- Let SuperAdmin switch among `ice-rink-rentals`, `roller-rink-rentals`, and future tenants.
- Let non-SuperAdmin users stay scoped to their tenant.

MVP fields:

- Tenant name
- Tenant ID
- Domain/canonical domain
- Status
- Active theme

### 3. Page List

Purpose:

- Browse pages for the selected tenant.

Required columns:

- Title
- Slug
- Status
- Page type
- Last updated
- Published date
- Sitemap include
- Robots
- Canonical domain health

Required actions:

- Edit
- Preview
- Duplicate
- Publish/unpublish
- Archive
- Export selected

### 4. Create Page

Purpose:

- Create a valid page skeleton for the selected tenant.

Required behavior:

- Generate normalized slug.
- Generate `id` and `PageId`.
- Set `tenantId` from selected tenant only.
- Choose template: blank, home, service page, contact page, local landing page.
- Start unpublished by default unless explicitly published.

### 5. Duplicate Page

Purpose:

- Clone a page safely within one tenant or into another tenant.

Required behavior:

- Require new slug.
- Recalculate canonical URL.
- Reset `publishedAt`.
- Preserve or reset content relationships by choice.
- Warn on duplicate content across domains.

### 6. Edit Page

Purpose:

- Edit structured content without drag/drop.

Existing foundation:

- Basic page info
- Metadata
- Search data
- Content blocks
- SEO/social data
- Content relationships
- JSON preview

Needed improvements:

- Add validation before save.
- Add dirty-state warning.
- Add save draft versus publish.
- Add revision snapshot before write.
- Use direct admin get endpoint.

### 7. Edit SEO

Purpose:

- Edit search and social metadata safely.

Fields:

- `seo.metaTitle`
- `seo.metaDescription`
- `seo.keywords`
- `seo.robots`
- `seo.canonicalUrl`
- `seo.alternateUrls`
- `seo.openGraph`
- `seo.twitterCard`
- `seo.structuredData`
- `includeInSitemap`

Validation:

- Canonical domain must match selected tenant unless explicitly overridden by SuperAdmin.
- `includeInSitemap=true` should require `isPublished=true` and indexable robots.
- `robots` should be selected from known options, not free text only.

### 8. Edit Content Blocks

Purpose:

- Edit all visible page text using structured fields.

Existing supported block editors:

- `Hero`
- `PrimaryCTA`
- `SecondaryCTA`
- `CardGrid`
- `FAQ`
- `Breadcrumbs`
- `TrustBar`
- `HowItWorks`
- `ServiceAreaMap`
- `LocalProTips`
- `Gallery`
- `Testimonials`
- `Contact`
- `Blog`
- Generic raw JSON fallback

MVP block actions:

- Add block
- Remove block
- Move up/down
- Duplicate block
- Expand/collapse block
- Validate block content

### 9. Edit Page Images

Purpose:

- Make the three major image slots explicit where possible:
  1. hero image
  2. dynamic/local rink image
  3. closing image

Recommended MVP:

- Keep fields stored in block content for now.
- Add an image summary panel that scans and edits the known image fields.
- Later add top-level `imageSlots` only if the product needs page-level image selection independent of block layout.

### 10. Publish/Unpublish

Purpose:

- Let editors control live visibility safely.

MVP behavior:

- Publish sets `isPublished=true` and `publishedAt` if missing.
- Unpublish sets `isPublished=false`.
- Publish should validate required page, SEO, canonical, and image alt fields.
- Publish should create a revision snapshot.

### 11. Archive/Delete

Purpose:

- Remove pages from public use without immediate hard delete.

Recommended behavior:

- Archive first.
- Archive should set unpublished, remove from sitemap, set noindex, and mark archive metadata.
- Hard delete should be SuperAdmin-only and protected by explicit confirmation.

### 12. Preview Page

Purpose:

- Show rendered output before publish.

Recommended MVP:

- Add `/dashboard/pages/[id]/preview` or side-by-side preview using the same block renderer.
- Preview should render draft data from the editor state, not only saved public data.
- Preview should indicate selected tenant and canonical domain.

## Live Text Editing Plan

The admin should edit all visible text through structured fields rather than drag/drop for MVP.

Required editable areas:

| Visible area | Existing fields or needed fields |
| --- | --- |
| Hero headline | `Hero.content.headline` exists. |
| Hero subheadline | `Hero.content.subheadline` exists. |
| Hero primary button | `Hero.content.buttonText`, `buttonLink` exist. |
| Hero secondary button | Polished/fallback renderer can use this pattern, but core TS Hero type/editor do not currently standardize it. Add fields if needed. |
| Hero eyebrow/trust line | Polished/fallback renderer can use this pattern, but seed/core editor do not currently standardize it. Add fields if needed. |
| TrustBar items | `TrustBar.content.items[].title/text/icon/alt` exists. |
| CardGrid titles/descriptions/links | `CardGrid.content.title/subtitle/cards[]` exists. |
| HowItWorks steps | `HowItWorks.content.title/steps[]` exists. |
| FAQ questions/answers | `FAQ.content.items[]` exists. |
| CTA title/body/buttons | `PrimaryCTA` and `SecondaryCTA` fields exist. |
| Contact title/subtitle | `Contact.content.title/subtitle` exists. |
| Contact form labels/placeholders | `Contact.content.formFields[]` exists. |
| SEO titles/metas | `seo.metaTitle/metaDescription/keywords` exists. |
| Canonical/robots/sitemap include | `seo.canonicalUrl`, `seo.robots`, `includeInSitemap` exist. |
| Image alt text | Multiple block image alt fields exist, but should be validated consistently. |
| Hero/local/closing image fields | Existing fields can support this, but need a consistent image-slot convention. |

Renderer gap to address:

- Shared `pumpkin-block-views` renders images for Hero, PrimaryCTA, CardGrid, and HowItWorks.
- `apps/ice-rink-web` currently uses polished local renderers for several of those blocks.
- The polished Hero renderer uses `backgroundImage` and `mainImage`.
- The polished PrimaryCTA, CardGrid, and HowItWorks renderers currently do not fully use all image fields already available in the shared models.

For the three major rental-site image slots, the frontend renderer should be aligned with the editor before editors are asked to manage images.

## Image Field Strategy

Recommended MVP image mapping:

| Slot | Storage now | Recommended rule |
| --- | --- | --- |
| Hero image | `Hero.content.backgroundImage` and/or `Hero.content.mainImage` | Require at least one hero image for production pages; require alt text for `mainImage`. |
| Dynamic/local rink image | Prefer `CardGrid.cards[].image`, `HowItWorks.steps[].image`, or `Gallery.images[]` | Add a page image summary panel and validate that local landing pages include at least one local/contextual rink image where available. |
| Closing image | `PrimaryCTA.content.backgroundImage` and/or `PrimaryCTA.content.mainImage` | Update polished renderer to support these fields or use shared block view for this block. |

Recommended later model addition if needed:

```text
pageAssets:
  hero:
    src
    alt
    caption
  localRink:
    src
    alt
    caption
  closing:
    src
    alt
    caption
```

Do not add top-level image slots until the rendering strategy is decided. If page-level image slots are added, define whether blocks reference them or duplicate them.

## Proposed Import/Export Workflow

### Export

MVP export formats:

- JSON first: full `Page` documents, one file per page, plus optional manifest.
- ZIP bundle: tenant-scoped pages, theme, and manifest.
- CSV next: flattened page rows for bulk editing high-value fields.
- XLSX later: feasible, but requires adding a library such as an Excel writer/reader package and stronger formula-injection handling.

JSON export should include:

- tenant/site key
- export timestamp
- export format version
- source app/API version
- selected pages
- page documents
- optional active theme
- validation summary

JSON export should exclude:

- API keys
- API hashes
- connection strings
- passwords
- JWT secrets
- local-only settings

CSV export should support a page-level flat shape:

- `tenantId`
- `pageSlug`
- `title`
- `description`
- `pageType`
- `isPublished`
- `includeInSitemap`
- `robots`
- `canonicalUrl`
- `metaTitle`
- `metaDescription`
- `keywords`
- `heroHeadline`
- `heroSubheadline`
- `heroButtonText`
- `heroButtonLink`
- `heroImage`
- `heroImageAlt`
- `primaryCtaTitle`
- `primaryCtaDescription`
- `primaryCtaButtonText`
- `primaryCtaButtonLink`
- `closingImage`
- `closingImageAlt`
- `contentBlocksJson`

CSV is lossy for nested block arrays. Use it for bulk text/SEO edits, not as the canonical page format.

### Import

Supported import sources:

- Single JSON page file.
- ZIP bundle of JSON page files.
- CSV file with flattened page rows.
- XLSX later, if the dependency and validation surface are accepted.

Required modes:

- Dry-run import.
- Diff/preview import changes.
- Upsert mode.
- Create-only mode.
- Update-only mode.
- Archive missing pages option.
- Downloadable error report.
- Downloadable import/export logs.

Required validation:

- `tenantId` must match selected tenant, unless an explicit SuperAdmin remap is selected.
- `pageSlug` must be normalized and unique within tenant.
- `id` and `PageId` must be present and consistent.
- `ContentData.ContentBlocks` must be an array.
- Each block must have `type` and `content`.
- Known block types should validate required fields.
- Unknown block types should be allowed only in advanced mode.
- `seo` must exist.
- Canonical domain must match selected tenant's canonical/domain rules.
- `isPublished=true` should require indexable SEO and publish-ready content.
- `includeInSitemap=true` should require `isPublished=true`.
- Image fields should require alt text when an image URL is present.
- No secret-like values should appear in imported JSON/CSV/XLSX.
- CSV/XLSX import must neutralize spreadsheet formula injection in text fields.

### Import Job Model

Recommended future containers/documents:

- `ImportJob`
- `ImportJobItem`
- `ExportJob`
- `PageRevision`

Minimum `ImportJob` fields:

- `id`
- `tenantId`
- `createdAt`
- `createdBy`
- `mode`
- `sourceFormat`
- `status`
- `summary`
- `errors`
- `warnings`
- `dryRun`
- `archiveMissing`

### Diff/Preview

For each page, show:

- create/update/archive/no-op
- title change
- slug change if allowed
- publish state change
- sitemap/robots change
- canonical change
- block count/type changes
- image field changes
- SEO field changes

Do not write anything during dry-run.

## Offline JSON Page Build Workflow

### Goal

Support page JSON generation offline, then let Next.js render those pages on Azure without relying on manual Cosmos edits.

### Recommended File Layout

Example staging/export layout:

```text
content/pages/
  ice-rink-rentals/
    manifest.json
    theme.json
    pages/
      home.json
      ice-rink-rentals.json
      contact.json
  roller-rink-rentals/
    manifest.json
    theme.json
    pages/
      home.json
      roller-rink-rentals.json
      contact.json
```

The JSON page files should use the same `Page` shape as Cosmos documents.

### JSON To Pumpkin Page Mapping

Offline JSON should map one-to-one to the current `Page` model:

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

Theme JSON should map to the current `Theme` model.

### JSON To Next.js Rendering

Add a server-only loader later:

- Resolve site from host.
- Resolve content mode: `api`, `json`, or `hybrid`.
- Load `{siteKey}/pages/{slug}.json` and `{siteKey}/theme.json`.
- Validate shape.
- Run token replacement.
- Render with existing `PageRenderer`, `SiteHeader`, `SiteFooter`, metadata, structured data, and sitemap helpers.

The renderer should not need separate page components for every offline page.

### Azure Rendering Options

Option A: Import JSON into Cosmos before deployment.

- Next.js keeps using Pumpkin API.
- Admin live editing works normally.
- Cloudflare/Azure caching can be purged/revalidated after publish/import.
- Recommended MVP production path.

Option B: Bundle JSON files into the Next.js Azure artifact and serve directly from the app.

- No Cosmos read needed at runtime for pages.
- Content changes require redeploy unless there is an external JSON store.
- Live admin editing does not update the rendered site unless edits are exported/redeployed.
- Better for emergency fallback, static snapshots, or Git-driven content.

Option C: Hybrid.

- Try Cosmos/API first.
- Fall back to bundled JSON if API is unavailable.
- Useful resilience pattern.
- Risk: editors may see content in Cosmos that is not what offline fallback serves.

### Source-Of-Truth Recommendation

For the next MVP:

1. Cosmos is the live source of truth.
2. Admin edits write to Cosmos.
3. JSON export/import is the portable staging and backup format.
4. Offline JSON bundled with Next.js is optional fallback or bootstrap content, not an independent live editing system.

If the future decision is Git/offline-first, then admin live editing should either be disabled in production or changed into a workflow that creates reviewed JSON bundles rather than directly mutating Cosmos.

### Risks Of Both Cosmos And Offline JSON

- Stale pages if JSON and Cosmos diverge.
- Canonical/sitemap drift by domain.
- Editors previewing one source while production serves another.
- Import overwriting newer live edits.
- Cache invalidation confusion across Azure and Cloudflare.
- Duplicate content across domains if tenant copy is exported and lightly modified.

Mitigation:

- Add `contentSource` and `contentVersion` metadata.
- Add import/export manifests.
- Require dry-run diff before writes.
- Create revisions before import.
- Show source-of-truth in admin UI.

## Data Model Requirements

### Required Page Shape

Every page should include:

- `id`
- `PageId`
- `tenantId`
- `pageSlug`
- `PageVersion`
- `Layout`
- `MetaData`
- `searchData`
- `ContentData`
- `ContentData.ContentBlocks`
- `contentRelationships`
- `seo`
- `isPublished`
- `publishedAt`
- `includeInSitemap`

Optional current field:

- `layoutPositions`

### Required Block Shape

Every block should include:

- `type`
- `content`

Known block types:

- `Hero`
- `PrimaryCTA`
- `SecondaryCTA`
- `CardGrid`
- `FAQ`
- `Breadcrumbs`
- `TrustBar`
- `HowItWorks`
- `ServiceAreaMap`
- `LocalProTips`
- `Gallery`
- `Testimonials`
- `Contact`
- `Blog`

### Casing Risks

The page model mixes Pascal-case and camel-case JSON property names:

- `PageId`
- `PageVersion`
- `Layout`
- `MetaData`
- `ContentData`
- `ContentData.ContentBlocks`
- `tenantId`
- `pageSlug`
- `searchData`
- `contentRelationships`
- `seo`

Do not normalize these names casually. Cosmos queries currently reference exact paths such as `c.MetaData.updatedAt`, and renderers expect `ContentData.ContentBlocks`.

CSV/XLSX import must map columns back to the exact document casing. A row that produces `metadata` instead of `MetaData`, or `contentData` instead of `ContentData`, can silently break rendering, sorting, sitemap behavior, or validation.

### Tenant Partition Rules

Use `tenantId` as the tenant partition boundary for page, theme, tenant, and form-entry data.

Import/export rules:

- Never trust imported `tenantId` over the selected admin tenant.
- SuperAdmin remap must be explicit.
- All page/theme/form-entry writes must use the selected tenant's partition key.
- Cross-tenant imports must rewrite canonical URLs, brand tokens, and page relationships.

### Page Slug Rules

Current slug behavior:

- `.NET` model lowercases `pageSlug`.
- `.NET` model replaces spaces, slashes, and backslashes with hyphens.
- TypeScript converter also normalizes slugs.

Recommended validation:

- lowercase only
- letters, numbers, hyphens
- no leading/trailing hyphen
- no consecutive hyphens
- unique per tenant
- `home` reserved for root route
- no slash paths until routing and slug model intentionally support nested slugs

### Publish/Sitemap Rules

Recommended rules:

- Public page fetch should only return `isPublished=true`.
- Sitemap should include only `isPublished=true` and `includeInSitemap=true`.
- `includeInSitemap=true` should be blocked for archived pages.
- `seo.robots` containing `noindex` should warn or block sitemap inclusion.
- Published page should have meta title, meta description, canonical URL, and visible H1/hero headline.

### Archive Versus Hard Delete

Recommendation:

- Add archive before adding admin hard delete.
- Archive should preserve content for rollback and historical imports.
- Hard delete should be rare, SuperAdmin-only, and require a typed confirmation.

Recommended future archive fields:

- `status`: `draft`, `published`, `archived`
- `archivedAt`
- `archivedBy`
- `archiveReason`

If no model change is allowed during MVP, emulate archive by setting:

- `isPublished=false`
- `includeInSitemap=false`
- `seo.robots=noindex, nofollow`

But this should be treated as a temporary convention, not a complete archive model.

### Revision And Rollback Strategy

Existing `PageVersion` increments on update, but previous versions are not stored as recoverable revisions.

Recommended:

- Before every update, publish/unpublish, archive, import, or hard delete, write a `PageRevision`.
- Include page snapshot, author, timestamp, reason, import job id if applicable, and content hash.
- Rollback restores a selected revision into the live `Page` document with a new `PageVersion`.
- Import jobs should create a pre-import export bundle and per-page revisions.

## Multi-Site Considerations

Current working tenants:

- `ice-rink-rentals`
- `roller-rink-rentals`

Current frontend site registry:

- Hardcodes the current two sites in `apps/ice-rink-web/src/config/sites.ts`.
- Resolves host to site definition.
- Reads tenant ID, API key, and canonical URL from site-specific env var names.

Implication:

- Admin can manage more tenants than the frontend currently knows how to route.
- Future tenants require either code changes to the site registry or a data-driven site registry loaded from configuration/Cosmos.

Required multi-site editor behavior:

- Tenant selector must scope every page/theme/import/export query.
- Page list must never mix tenants.
- Import must default to the selected tenant.
- Export must include tenant identity and canonical metadata.
- Duplicate page across tenants must rewrite canonical URLs and brand/service copy.
- Preview must show the selected tenant/domain.
- Sitemap and canonical validation must use the selected tenant's canonical domain.
- Cross-domain duplicate content checks should compare title/meta/body/block text between tenants and warn before publish.

Duplicate-content prevention:

- Check for copied canonicals from another tenant.
- Check Open Graph and structured data URLs.
- Compare page titles and meta descriptions across tenants.
- Compare visible block text similarity.
- Require an editor acknowledgement when copying a page between `ice-rink-rentals` and `roller-rink-rentals`.

## Safety Rules

Minimum safety rules for the editor/import/export system:

- Do not include secrets in exports or reports.
- Do not write `.env.local` or development appsettings files from admin tooling.
- Do not expose tenant API keys in browser-side admin code.
- Use JWT admin endpoints for admin writes.
- Dry-run imports by default.
- Create revisions before writes.
- Prefer archive over hard delete.
- Validate tenantId, slug, canonical, sitemap, robots, SEO, and blocks before publish.
- Sanitize any field rendered as HTML.
- Treat code-level editing as advanced and role-gated.
- Structured data should be parsed/validated JSON-LD, not arbitrary script editing.
- Keep import/export logs downloadable but scrubbed of secrets.
- Cloudflare/Azure caches must be purged or revalidated after publish/import.

Special caution:

- `Blog` rendering currently supports HTML body rendering through `dangerouslySetInnerHTML` in the frontend path. Any future code-level or HTML editing must include sanitization and permissions before production use.

## Implementation Phases

### Phase 1: Admin Audit Fixes

Goals:

- Align auth client/API behavior.
- Make admin API calls JWT-only where possible.
- Use direct admin page get endpoint.
- Regenerate/update API docs after endpoint cleanup.

Recommended tasks:

- Add `GET /api/auth/verify` or remove verify call and document token behavior.
- Add `POST /api/auth/logout` as a no-op/token-clear endpoint or remove backend call.
- Update `apiClient.getPage()` to call `GET /api/admin/pages/{tenantId}/{pageSlug}`.
- Remove or stop relying on browser-exposed API key behavior for admin routes.
- Add API/client error handling that does not log sensitive values.

### Phase 2: Page List/Read-Only Viewer

Goals:

- Make the page list reliable for both current tenants.
- Add a read-only page detail view before broad writes.

Recommended tasks:

- Add filters for status, sitemap, page type, and search.
- Show canonical/robots warnings.
- Add view JSON and rendered preview links.

### Phase 3: Structured Page Editor

Goals:

- Harden the existing editor.

Recommended tasks:

- Add schema validation.
- Add dirty-state warning.
- Add save draft action.
- Add image summary panel.
- Add missing Hero fields if the product wants eyebrow/trust/secondary CTA standardized.
- Align polished renderers with editable image fields.

### Phase 4: Create/Duplicate/Unpublish/Archive

Goals:

- Complete safe page lifecycle.

Recommended tasks:

- Add duplicate page action.
- Add dedicated publish/unpublish endpoint or service method.
- Add archive model/endpoint.
- Add revision snapshot on every lifecycle action.
- Delay hard delete until archive and rollback are working.

### Phase 5: Import/Export JSON

Goals:

- Add canonical portable page format.

Recommended tasks:

- Export selected/all pages to JSON bundle.
- Import JSON with dry-run.
- Validate page shape and blocks.
- Show diff.
- Support create-only, update-only, and upsert.
- Write import logs.

### Phase 6: Import/Export CSV/XLSX

Goals:

- Support spreadsheet-style bulk text and SEO workflows.

Recommended tasks:

- Add CSV export/import first.
- Flatten common text/SEO/image fields.
- Keep full block JSON available for advanced edits.
- Add XLSX only after choosing a dependency and formula-injection strategy.

### Phase 7: Offline JSON Generation/Rendering Plan

Goals:

- Let Next.js render generated JSON pages on Azure when needed.

Recommended tasks:

- Define content bundle format and manifest.
- Add server-only JSON loader behind a feature flag.
- Support `api`, `json`, and `hybrid` content modes.
- Keep Cosmos as MVP live source of truth unless an explicit Git/offline-first decision is made.

### Phase 8: Preview/Diff/Validation

Goals:

- Make editor confidence high before publish/import.

Recommended tasks:

- Render preview from draft editor state.
- Add import diff preview.
- Validate canonicals and sitemap inclusion.
- Add cross-tenant duplicate-content warnings.
- Add structured data validation.

### Phase 9: Better UX And Permissions

Goals:

- Move from functional admin to safe editorial product.

Recommended tasks:

- Role-based actions: Viewer, Editor, TenantAdmin, SuperAdmin.
- Toasts and inline validation.
- Bulk actions.
- Activity logs.
- Form-entry list/export.
- Media/image selector.

### Phase 10: Azure Deployment Readiness

Goals:

- Prepare for Azure + Cloudflare CDN.

Recommended tasks:

- Define production env var strategy.
- Use secure configuration/Key Vault for secrets.
- Define cache headers and revalidation/purge behavior.
- Add health checks.
- Add deployment docs for API, Next frontend, Cosmos, and Cloudflare.
- Test tenant host/domain/canonical separation in production-like environment.

## Key Risks

- Auth mismatch: admin client calls verify/logout endpoints that do not exist.
- Admin page get mismatch: backend has direct get endpoint, but client currently list-filters.
- Public API-key page write/delete endpoints increase blast radius if tenant keys leak.
- No page revisions yet; updates and imports cannot be rolled back cleanly.
- No archive model yet; hard delete is too risky for editor MVP.
- Mixed JSON casing can break Cosmos queries and renderers.
- OpenAPI spec appears stale.
- CSV/XLSX can be lossy for nested block data.
- Spreadsheet formula injection must be handled for CSV/XLSX.
- Code/HTML editing can create XSS risk.
- Cosmos versus offline JSON can create source-of-truth drift.
- Multi-site content can accidentally share canonicals, schema URLs, or duplicate copy.
- Cloudflare/Azure caching can serve stale pages after publish/import.
- Existing docs should be scrubbed before public sharing to ensure no sample credentials or local-only sensitive guidance leak outside the dev context.

## Recommended Next Codex Implementation Prompt

```text
We are working inside the SDI-AI/pumpkin-cms repo.

Goal:
Implement Phase 1 admin audit fixes for the Pumpkin CMS admin editor workflow.

Do not modify .env.local.
Do not modify appsettings.Development.json.
Do not include secrets.
Do not touch production data.

Tasks:
1. In apps/admin, update the API client so getPage uses the existing direct backend endpoint:
   GET /api/admin/pages/{tenantId}/{pageSlug}
   instead of listing all pages and filtering client-side.
2. Align auth verify/logout behavior:
   either add minimal backend endpoints for GET /api/auth/verify and POST /api/auth/logout,
   or update the admin client/AuthContext so it does not call missing endpoints.
   Prefer the smallest safe change that preserves current login behavior.
3. Ensure admin JWT requests do not require or depend on a browser-exposed tenant API key.
4. Add focused validation/error handling without logging secrets.
5. Update or add a root report describing the implementation and any remaining admin editor gaps.

Run relevant type-check/build commands for changed projects if feasible.
Report exactly what changed and what was not implemented.
```

