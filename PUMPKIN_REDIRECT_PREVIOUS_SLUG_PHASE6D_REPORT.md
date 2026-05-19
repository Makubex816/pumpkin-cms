# Pumpkin Redirect / Previous Slug Manager Phase 6D Report

## Summary

Phase 6D adds a safe page-level redirect and previous-slug foundation for production slug changes. The implementation uses the existing Page document and Phase 6C revision update path instead of adding a new Cosmos container.

No Azure deployment, Cloudflare change, hard delete, provider research, state research, or production page creation was performed.

## Files Changed

- `apps/pumpkin-net-models/Models/Page.cs`
- `packages/pumpkin-ts-models/src/models/Page.ts`
- `packages/pumpkin-ts-models/src/index.ts`
- `packages/pumpkin-ts-models/dist/*`
- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/PageRevisionHelper.cs`
- `apps/pumpkin-api/Services/PageRedirectGuard.cs`
- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
- `apps/admin/src/app/dashboard/pages/[id]/view/page.tsx`
- `apps/admin/src/app/dashboard/pages/page.tsx`
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- `apps/ice-rink-web/src/app/[...slug]/page.tsx`
- `apps/ice-rink-web/scripts/static-publish.mjs`
- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs`
- `deployment/static-azure/README.md`
- `deployment/static-azure/static-redirects.md`
- `deployment/static-azure/validate-static-output.mjs`
- `deployment/static-azure/scripts/static-publish-dry-run.mjs`

## Redirect Data Shape

The Page document now supports:

- `previousSlugs: string[]`
- `redirects: [{ from, to, type, reason, createdAt, createdBy, active }]`

Supported redirect reasons:

- `slug_changed`
- `manual`
- `imported`
- `canonical_cleanup`

The MVP stores redirects on the page document. No new Cosmos container is required.

## Slug-Change Behavior

Admin updates now pass through centralized redirect handling in `PageRevisionHelper.PrepareUpdate()`.

When an existing page slug changes:

- the old slug is added to `previousSlugs`
- a 301 redirect is created from old slug to new slug
- duplicates and same-slug redirects are normalized away
- canonical URL is updated when it clearly matched the old slug
- a launch note is added when canonical review is needed
- `staticPublishing.needsRebuild` remains true through the Phase 6C update path
- a revision snapshot is still created before overwrite

The API now validates malformed redirects, redirect loops, duplicate active redirect sources, target slug conflicts, and same-tenant redirect source collisions.

## Runtime Redirect Fix

Root cause: the public CMS runtime path created redirect records correctly, but page retrieval only queried published pages by exact current `pageSlug`. When the old slug was requested, Pumpkin API returned no page and the Next.js route rendered Page Not Found. The first redirect fallback also needed to avoid an overly strict Cosmos array-member match so stored redirect records can be normalized in memory before evaluation.

The runtime fix is:

- `CosmosDataConnection.GetPageAsync()` now falls back to same-tenant published page redirect scanning when exact published slug lookup misses.
- Redirect resolution only returns published pages from the same tenant partition.
- Redirect loops, empty targets, same-slug redirects, and missing/unpublished targets are ignored.
- `apps/ice-rink-web/src/app/[...slug]/page.tsx` now detects when the CMS returns a page whose canonical `pageSlug` differs from the requested slug and calls `permanentRedirect()` to the current slug path.
- Static mode is explicitly excluded from this runtime redirect branch so static export keeps using generated redirect artifacts.

Local runtime smoke-test result:

- `/phase-6d-redirect-test` returned `200`.
- `/phase-4-json-import-52530861` returned `308` with `Location: /phase-6d-redirect-test`.
- The redirect is same-tenant and does not loop.

## Admin Editor Behavior

The structured editor now includes a `Slug / Redirects` section.

It shows:

- editable `pageSlug`
- editable `previousSlugs`
- current slug
- redirect coverage status
- canonical path status
- active redirect count
- active redirect JSON

If a published page slug changes, the editor requires confirmation before save and explains the SEO, Google Ads, static deployment, internal link, and backlink impact.

## Page Detail/List Behavior

The read-only page detail view now shows:

- current slug
- previous slugs
- active redirect count
- redirect coverage
- canonical slug status
- raw redirect records
- existing revision and `staticPublishing.needsRebuild` fields

The page list now shows small indicators for:

- previous slugs
- active redirects
- canonical review needed

## Import/Export Handling

JSON import/export preserves `previousSlugs` and `redirects` as part of the full Page shape.

CSV/XLSX export now includes:

- `previousSlugs`
- `redirects`
- `redirectCount`
- `hasActiveRedirects`

CSV/XLSX import parses redirect JSON, rejects malformed active redirects, warns on missing previous-slug coverage, and continues to preserve unknown fields and Phase 6C revision behavior for write modes.

## Static Redirect Artifact Behavior

Static publishing now writes:

```text
apps/ice-rink-web/.static-artifacts/{SITE_KEY}/redirects.json
apps/ice-rink-web/.static-artifacts/{SITE_KEY}/out/redirects.json
```

The manifest is copied into publish dry-run release folders and counted in the dry-run manifest/summary.

Current seed-site validation generated `redirectCount: 0` for both Ice and Roller because the seed pages have no previous slugs or redirects yet.

The runtime CMS redirect fix does not change static redirect artifacts. Static publishing still emits `redirects.json` for hosting-layer redirects in Azure Static Web Apps or Cloudflare later.

## Static Validation Behavior

Static validation now warns on:

- previous slug without active redirect coverage
- redirect loops
- duplicate redirect source paths
- canonical URL path mismatch
- old slug still present as a sitemap page
- redirect target missing or unpublished
- absolute redirect URL crossing outside the tenant domain

The deployment validator also checks `redirects.json` for parse errors, loops, duplicate from paths, and non-301 records.

## Revision/Rollback Interaction

Redirect creation is part of the same admin update path that creates Phase 6C revision snapshots. Rollback behavior remains intact and no hard delete was added.

If rollback restores an older slug, the same update path can create redirect metadata and mark static publishing stale.

## Checks Run

- `npm run type-check` in `apps/admin` - passed
- targeted admin lint for changed page files - passed
- `npm run build` equivalent TypeScript package compile using admin TypeScript/type roots - passed
- `dotnet build apps/pumpkin-net-models/pumpkin-net-models.csproj` - passed
- `dotnet build apps/pumpkin-api/pumpkin-api.csproj` - passed after stopping locked local `pumpkin-api` process
- `npm run type-check` in `apps/ice-rink-web` - passed
- `npm run lint` in `apps/ice-rink-web` - passed
- `npm run build` in `apps/ice-rink-web` runtime mode - passed
- `npm run export:static:ice` - passed, `redirectCount: 0`
- `npm run export:static:roller` - passed after regenerating stale local Roller artifacts, `redirectCount: 0`
- static output validator for Ice - passed
- static output validator for Roller - passed
- `npm run publish:dry-run` - passed, redirect counts included
- `npm run validate:snapshot:ice` - passed with existing production-readiness warnings
- `npm run validate:snapshot:roller` - passed with existing production-readiness warnings
- `git diff --check` - passed
- protected config diff check for `.env.local` and `appsettings.Development.json` - no changes
- broad secret-pattern scan over changed files - false positives were code variable assignments and key-generation expressions, not secret values
- stricter secret literal scan over changed and untracked files - passed

## Runtime Verification

Browser-based admin mutation was already performed before this runtime redirect fix: the new slug rendered, admin detail showed the old slug in `previousSlugs`, an active redirect existed from old slug to new slug, and `staticPublishing.needsRebuild` was true.

This pass fixed and HTTP-tested the missing public runtime redirect behavior in the API/frontend path:

- new slug `/phase-6d-redirect-test` returned `200`
- old slug `/phase-4-json-import-52530861` returned `308` with `Location: /phase-6d-redirect-test`
- admin detail still showed the previous slug and redirect record before this fix and the redirect record behavior was preserved

The temporary Pumpkin API process started for the smoke test was stopped after verification.

Recommended manual runtime smoke test:

1. Start Pumpkin API and admin.
2. Select `ice-rink-rentals`.
3. Open a safe test page.
4. Change slug from `test-slug-a` to `test-slug-b`.
5. Save.
6. Confirm previous slug, redirect record, revision metadata, and `staticPublishing.needsRebuild`.
7. Visit the old slug and confirm it redirects to the new slug.
8. Run static export/dry-run and confirm `redirects.json` contains the redirect.

## Known Limitations

- `redirects.json` is generated but not automatically translated into Azure Static Web Apps or Cloudflare rules.
- Static redirect validation is warning-first unless output is structurally broken.
- Full redirect timeline/history UI is not implemented.

## Next Recommended Phase

Phase 6E should add a manual runtime smoke-test package and, if approved, a safe translation step from `redirects.json` into a non-active `staticwebapp.config.json` redirect preview for Azure Static Web Apps staging.
