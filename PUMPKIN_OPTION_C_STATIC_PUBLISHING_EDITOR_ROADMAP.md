# Pumpkin Option C Static Publishing Editor Roadmap

## Executive Summary

Option C changes Pumpkin CMS from a public-request content API dependency into a content control and publishing engine.

The public rental sites should be generated from approved tenant content, exported as static Next.js output, deployed to Azure static hosting, and served through Cloudflare. Pumpkin API and Cosmos still matter, but their role shifts toward editing, validation, publishing orchestration, imports, exports, revisions, form capture, and future knowledge-vault workflows.

The recommended strategy is:

- Cosmos remains the editable CMS store.
- JSON exports/imports become portable and publishable content artifacts.
- Static export becomes the public delivery format.
- Public page views should not call Pumpkin API on every request.
- Publishing becomes a controlled pipeline: edit, validate, export/build, deploy, purge.

No source code, `.env.local`, `appsettings.Development.json`, production data, or secrets were modified for this report.

## Reviewed

- `PUMPKIN_ADMIN_EDITOR_IMPORT_EXPORT_AUDIT.md`
- `apps/admin`
- `apps/ice-rink-web`
- `apps/pumpkin-api`
- `tools/ice-rink-local-seed`
- `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals`
- `tools/ice-rink-local-seed/seed-sites/roller-rink-rentals`

Note: the prompt referenced root `seed-sites/...`; in this checkout, the tenant seed folders are under `tools/ice-rink-local-seed/seed-sites/...`.

## 1. How Option C Changes Admin/Editor Requirements

Before Option C, the admin editor could be treated as a live CMS editor whose pages are fetched by the public frontend at runtime.

With Option C, the admin must become a publishing control plane:

- Editors still create, edit, unpublish, archive, and manage live text.
- Saving a draft updates Cosmos but does not necessarily update the public site.
- Publishing should create a reviewed, validated content snapshot.
- The publish action should trigger or prepare a static build artifact.
- The static build must include tenant pages, theme, metadata, sitemap, robots, and static assets.
- Deployment should push static output to the correct Azure static hosting target.
- Cloudflare should be purged after successful deployment.
- Public pages should read content from static artifacts, not call Pumpkin API on each request.

This adds admin requirements that were optional before:

- Publish status must distinguish draft, approved, published-to-static, unpublished, archived, and failed publish states.
- Admin needs a publish history or deployment history.
- Preview must show the exact content that will be built.
- Validation must run before static publishing, not after.
- Import/export becomes part of the publishing pipeline, not only backup tooling.
- Public delivery must be reproducible from content artifacts.

## 2. Recommended Source-Of-Truth Strategy

### Cosmos As Editable CMS Store

Cosmos should remain the editable source for admin-managed content:

- Page drafts
- Published/approved page records
- Tenant records
- Theme records
- Revisions
- Import/export job records
- Publish job records
- Form-entry records
- Future knowledge vault metadata and review queue state

Admin users should edit Cosmos-backed records through JWT admin endpoints, not through browser-exposed tenant API keys.

### JSON Exports/Imports As Portable Artifacts

JSON should be the canonical portable format:

- One `Page` document maps to one page JSON file.
- One tenant export bundle contains pages, theme, manifest, validation report, and optional publish metadata.
- JSON bundles can be used for backups, dry-run imports, static builds, tenant cloning, and review.
- JSON artifacts should not include API keys, hashes, passwords, connection strings, JWT secrets, or local-only settings.

Recommended artifact shape:

```text
content-artifacts/
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

### Static Export As Public Delivery Format

The public site should be a static output folder per tenant/domain:

```text
static-output/
  ice-rink-rentals/
    index.html
    ice-rink-rentals/
    contact/
    sitemap.xml
    robots.txt
  roller-rink-rentals/
    index.html
    roller-rink-rentals/
    contact/
    sitemap.xml
    robots.txt
```

The public delivery source becomes the deployed static output, while Cosmos remains the editorial source.

## 3. Page Editing Before Static Publishing

The admin editor should preserve a staged workflow:

1. Draft edit in Cosmos.
2. Validate required fields and block shape.
3. Preview rendered page using the same renderer/static content loader as build.
4. Save revision snapshot.
5. Mark page approved or ready for publish.
6. Generate tenant JSON artifact.
7. Run static build.
8. Deploy static output.
9. Purge Cloudflare cache.
10. Mark publish job successful or failed.

The editor still needs:

- Page list by tenant.
- Read-only view for safety.
- Structured page editor.
- Create page.
- Duplicate page.
- Save draft.
- Edit visible text.
- Edit SEO.
- Edit image fields and alt text.
- Unpublish.
- Archive.
- Preview.

Important Option C distinction:

- `Save draft` writes to Cosmos only.
- `Publish` validates and prepares the next static artifact.
- `Deploy` makes static output public.

For early MVP, publish and deploy may be one button behind the scenes, but the data model should keep them separate.

## 4. How Import/Export Should Feed Static Builds

Import/export should become a first-class part of the publishing pipeline.

### Export To Static Build

The static build should consume a tenant export bundle generated from approved Cosmos content:

- Query selected tenant pages.
- Include only publishable pages unless building a preview artifact.
- Include active theme.
- Include site/domain metadata.
- Include sitemap and robots generation inputs.
- Write a manifest with content version and build timestamp.
- Run validation before build starts.

Recommended manifest fields:

- `artifactVersion`
- `tenantId`
- `siteKey`
- `brand`
- `domain`
- `canonicalUrl`
- `exportedAt`
- `exportedBy`
- `source`
- `pages`
- `themeId`
- `validation`
- `contentHash`

### Import From JSON

JSON imports should write back into Cosmos only after dry-run validation and diff review.

Required modes:

- Dry-run
- Upsert
- Create-only
- Update-only
- Archive missing pages

Required import outputs:

- Diff preview
- Validation report
- Per-row or per-page errors
- Import job log
- Revision snapshots before writes

### CSV/XLSX Relationship To Static Builds

CSV/XLSX should remain a bulk editing interface, not the static build source. CSV/XLSX imports should normalize into Cosmos page documents first, then JSON export/static build should run from the approved Cosmos records.

## 5. Required Page Image Slot Model

Rental pages should support three major image slots where possible:

- Hero image
- Local/dynamic rink image
- Closing image

Each slot needs:

- image source
- alt text
- optional caption/credit
- optional focal point later

### MVP Storage Recommendation

Do not immediately add an independent image system. First standardize how the existing page/block model maps to these slots.

Recommended MVP mapping:

| Slot | Existing likely storage | Required fields |
| --- | --- | --- |
| Hero image | `Hero.content.backgroundImage` or `Hero.content.mainImage` | `backgroundImageAltText` or `mainImageAltText` |
| Local/dynamic rink image | `CardGrid.cards[].image`, `HowItWorks.steps[].image`, `Gallery.images[]`, or future local block | matching card/step/gallery alt text |
| Closing image | `PrimaryCTA.content.backgroundImage` or `PrimaryCTA.content.mainImage` | `alt` or dedicated CTA image alt |

### Later Page-Level Model

If editors need one consistent image panel across all templates, add a page-level image slot model:

```text
imageSlots:
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

If page-level slots are added, define whether blocks reference these slots or duplicate image URLs inside block content. Referencing is cleaner, but block duplication/export must then include slot references safely.

### Validation Rules

- Published pages should warn or fail when an image slot is expected but blank.
- Any image URL should require alt text.
- Canonical production pages should use production-safe image URLs.
- Static export should copy or preserve image URLs in a way Azure/Cloudflare can serve.
- Local-proof empty image fields are acceptable for proof content but not final production publishing.

## 6. Static Export Requirements For `apps/ice-rink-web`

The current frontend is a working dynamic multi-site app. Option C requires a static-compatible build mode.

### Current Dynamic Behavior

Current `apps/ice-rink-web` behavior includes:

- Host-based site resolution in `src/config/sites.ts` and `src/lib/resolve-site.ts`.
- Runtime Pumpkin API fetches in `src/lib/pumpkin-api.ts`.
- Dynamic home and catch-all page rendering.
- Dynamic `sitemap.xml` route.
- Next API route for contact submissions at `/api/contact`.
- Local fallback pages and theme.

This is good for proof and development, but it is not yet a pure static export pipeline.

### SITE_KEY Build Mode

Static export should add a build-time `SITE_KEY` mode:

- `SITE_KEY=ice-rink-rentals`
- `SITE_KEY=roller-rink-rentals`
- future tenant keys

In static mode, `SITE_KEY` should select one tenant/site at build time. The build should not depend on request host to decide which tenant's pages are generated.

Recommended behavior:

- `SITE_KEY` resolves site definition.
- Static content loader reads that tenant's JSON artifact.
- `generateStaticParams` returns all published slugs for that tenant.
- Metadata uses the selected tenant canonical URL.
- Build fails if required tenant content is missing or invalid.

### Separate Static Output Per Domain

Each public domain should get its own build artifact:

- `iceskatingrinkrentals.com` from `SITE_KEY=ice-rink-rentals`
- `rollerrinkrentals.com` from `SITE_KEY=roller-rink-rentals`

Do not build one static output that tries to serve multiple domains via runtime host detection. Static export should produce one domain-specific output at a time.

### Generated `sitemap.xml`

The existing dynamic sitemap route should be replaced or supplemented with static generation:

- Generate from the tenant JSON artifact.
- Include only published pages with `includeInSitemap=true`.
- Exclude pages with `noindex`.
- Use the tenant canonical URL.
- Write `sitemap.xml` into the static output.

### Generated `robots.txt`

Add static `robots.txt` generation per tenant:

- Include the tenant canonical sitemap URL.
- Respect tenant-level staging/noindex settings.
- Production default should allow public pages.
- Preview/staging output should disallow indexing unless explicitly approved.

### Static-Compatible Forms Strategy

Static export cannot rely on a Next API route to hide server-side credentials. The current `/api/contact` pattern works in a server-rendered Next deployment, but not in a pure static export.

Recommended form strategies, from safest MVP to more advanced:

1. Azure Function form endpoint
   - Static site posts to an Azure Function.
   - Function validates origin, tenant, CAPTCHA/honeypot, and rate limits.
   - Function writes to Pumpkin API or directly to the form-entry store.

2. Pumpkin public form endpoint redesigned for browser-safe submission
   - No tenant API key in browser.
   - Validate allowed domain/origin.
   - Require CAPTCHA or proof-of-work/honeypot.
   - Rate limit by IP and tenant.
   - Accept only form-entry writes, never page writes.

3. Third-party/static form provider
   - Quickest operational fallback, but weaker ownership of workflow.

Do not expose tenant API keys in static JavaScript.

## 7. Azure/Cloudflare Deployment Implications

### Azure

Option C likely needs:

- Azure static hosting target per public site or per tenant output.
- A build artifact per `SITE_KEY`.
- CI/CD job that can build one tenant or all tenants.
- Optional Azure Function for contact forms and publish webhooks.
- Secure environment/config management outside repo.
- Build logs and deploy logs tied back to Pumpkin publish jobs.

Recommended publish job steps:

1. Lock tenant publish job.
2. Export approved tenant content from Cosmos to JSON artifact.
3. Validate artifact.
4. Build `apps/ice-rink-web` with `SITE_KEY`.
5. Generate static output.
6. Upload to Azure static hosting.
7. Run smoke checks.
8. Purge Cloudflare.
9. Mark publish job complete.

### Cloudflare

Cloudflare should sit in front of Azure static hosting:

- DNS and TLS per domain.
- CDN caching for HTML, assets, sitemap, and robots.
- Cache purge after deploy.
- Optional WAF/bot controls for form endpoint.
- Redirect/canonical rules.

Cache rules should be simple:

- Long cache for hashed assets.
- Shorter or purge-driven cache for HTML.
- Purge by host/site key after successful deployment.

### Deployment Safety

Required safeguards:

- Do not deploy failed validation artifacts.
- Do not purge Cloudflare before Azure deploy succeeds.
- Keep previous static artifact for rollback.
- Record deployed content hash.
- Record build/deploy/purge status in Pumpkin.

## 8. Future Knowledge Vault Fit

The knowledge vault should fit into Option C as a content intelligence and review system, not as a public runtime dependency.

Future vault capabilities:

- Question logging from forms/search/chat/internal tooling.
- Answer cache.
- Markdown knowledge vault.
- Review queue.
- Approved answers.
- FAQ/content update suggestions.
- Tenant-aware knowledge separation.
- Static FAQ/content regeneration.

### Tenant-Aware Vault Model

Every vault item should be tenant-scoped:

- `tenantId`
- `siteKey`
- source page or form
- question
- draft answer
- approved answer
- status
- reviewer
- tags/topics
- related page slugs
- updatedAt

Cross-tenant reuse should be explicit. A roller rink answer should not silently publish to ice rink pages without tenant review, canonical review, and wording changes.

### How It Fits Without Overbuilding Now

Do not build the full vault before the editor/publisher is safe.

MVP-friendly path:

- Start by logging questions from contact forms or admin-entered prompts.
- Store proposed answers as draft knowledge records.
- Let a reviewer approve an answer.
- Later, allow approved answers to update FAQ blocks or generate suggested JSON patches.
- Static publishing then deploys the updated FAQ/content like any other page edit.

The public static site does not need to query the vault. Approved knowledge becomes page content through the admin/editor/publish pipeline.

## 9. Updated Implementation Phases

### Phase 1: Admin Read-Only Manager

Status: foundation implemented in the branch/report context.

Purpose:

- Safely list tenant pages.
- View page details, SEO, image signals, and content blocks.
- Avoid destructive actions.

Option C addition:

- Show content source and eventual static publish status when available.

### Phase 1.5: Auth/Runtime Verification

Purpose:

- Verify login, tenant selection, page list, and read-only detail view against local API/Cosmos.
- Resolve missing auth verify/logout behavior.
- Fix existing admin lint/type/build blockers.
- Confirm both `ice-rink-rentals` and `roller-rink-rentals` can be listed from admin.

Deliverables:

- Auth flow verified without exposing secrets.
- Admin validation baseline is clean.
- Runtime notes documented.

### Phase 2: Structured Page Editor

Purpose:

- Harden structured editing before publish automation.

Deliverables:

- Save draft.
- Dirty-state warning.
- Field validation.
- SEO editor.
- Block editor.
- Image-slot summary/editor.
- Rendered preview from draft content.

Option C addition:

- Preview should use the same JSON artifact shape/static renderer path as the future build.

### Phase 3: Create/Duplicate/Unpublish/Archive

Purpose:

- Add safe page lifecycle.

Deliverables:

- Create page from template.
- Duplicate page within tenant or across tenant with canonical rewrite.
- Dedicated unpublish.
- Archive before hard delete.
- Revision snapshot before lifecycle changes.

Option C addition:

- Unpublish/archive should trigger static publish workflow or mark public static output stale until republished.

### Phase 4: JSON Import/Export

Purpose:

- Establish the portable content artifact format.

Deliverables:

- Export tenant page/theme JSON bundle.
- Import JSON with dry-run.
- Diff preview.
- Upsert/create-only/update-only modes.
- Archive missing pages option.
- Downloadable logs.

Option C addition:

- Export bundle becomes input to static build.

### Phase 5: Static Export Publishing

Purpose:

- Implement Option C public delivery.

Deliverables:

- `SITE_KEY` build mode in `apps/ice-rink-web`.
- Static JSON content loader.
- `generateStaticParams` from tenant artifact.
- Separate static output per domain.
- Static `sitemap.xml`.
- Static `robots.txt`.
- Static-compatible form endpoint strategy.
- Publish job model.
- Azure deploy hook/script.
- Cloudflare purge hook/script.

This is the core Option C phase.

### Phase 6: CSV/XLSX Import/Export

Purpose:

- Enable spreadsheet-style bulk editing after JSON import/export is stable.

Deliverables:

- CSV export for common page/SEO/text/image fields.
- CSV import with dry-run/diff.
- XLSX support if dependency and formula-injection strategy are accepted.

Rule:

- CSV/XLSX normalizes into Cosmos first, then JSON/static publishing flows from Cosmos.

### Phase 7: Knowledge Vault/Question Logging

Purpose:

- Capture questions and approved answers for future FAQ/content expansion.

Deliverables:

- Tenant-scoped question log.
- Answer draft/cache records.
- Review queue.
- Approved answers.
- Optional suggested FAQ/page updates.

Option C rule:

- Approved vault content becomes static page content through the same editor/publish pipeline.

## 10. Recommended Immediate Next Implementation Step

Recommended next step: Phase 1.5 auth/runtime verification and validation cleanup.

Do this before adding more editor or publishing features because static publishing will magnify existing admin/runtime uncertainty.

Immediate prompt:

```text
We are working inside the SDI-AI/pumpkin-cms repo on branch feature/admin-page-editor-import-export.

Goal:
Implement Phase 1.5 for the admin editor/static publishing roadmap: auth/runtime verification and clean validation baseline.

Do not modify .env.local.
Do not modify appsettings.Development.json.
Do not include secrets.
Do not modify production data.
Do not implement static publishing yet.
Do not implement import/export yet.

Tasks:
1. Verify the admin login, tenant selector, page list, and read-only page detail routes against the local Pumpkin API/Cosmos setup without exposing credentials.
2. Resolve the auth verify/logout mismatch with the smallest safe change.
3. Fix existing admin lint/type blockers that prevent a clean build, staying scoped to admin validation issues.
4. Confirm the admin can list/read pages for:
   - ice-rink-rentals
   - roller-rink-rentals
5. Update the Phase 1 report or create a Phase 1.5 report with:
   - runtime verification results
   - files changed
   - checks run
   - remaining blockers

Report exactly what changed and what was not implemented.
```

## Key Risks To Track

- Static export and current request-host site resolution are in tension.
- Static export and current Next `/api/contact` route are in tension.
- Tenant API keys must not be exposed in static JavaScript.
- JSON/Cosmos drift can occur if artifacts are edited independently.
- Existing seed content has empty image fields suitable for local proof but not final production publishing.
- Dynamic sitemap route must become static-generated for Option C.
- No `robots.txt` generation is currently evident in `apps/ice-rink-web`.
- Public page hard delete endpoints exist in API; admin workflows should prefer archive and revisioned publishing.
- Knowledge vault must remain tenant-aware to avoid cross-domain duplicate or incorrect answers.
- Cloudflare purge must happen only after successful Azure deployment.
