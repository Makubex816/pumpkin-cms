# Pumpkin Tenant Website Publish Readiness V2.8.2 Ice Static Source Route Repair Report

Status: complete local repair and revalidation.

Result package:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-2-ice-static-source-route-repair-result/
```

Tracker recommendation:

- Current reference: `V2.8.2`
- Current lane: `V2.8 Tenant Website / Publish Readiness`
- Provisional V2 overall completion: `88%`
- V2.8 completion: `74%`
- Layer refs: `L01`, `L02`, `L03`, `L04`, `L06`, `L07`, `L08`, `L09`, `L10`, `L11`, `L12`, `L15`
- Next recommended reference: `V2.8.3 Tenant Website sanitized build/runtime QA evidence package and staging publish approval worksheet`

## What Changed

- Added safe local Ice `service-areas.json` seed page.
- Removed obsolete Ice seed pages `ice-rink-rentals.json` and `events-holiday-activations.json`.
- Updated Ice seed theme navigation to `/`, `/service-areas`, `/contact`.
- Updated Ice seed page internal links away from obsolete routes.
- Updated the local seed validator and README to the current Ice route model.

## Route Result

The canonical Ice route model is now represented locally:

- `/`
- `/contact`
- `/service-areas`

Static output validation and staging package validation both passed with 42 files, 0 errors, and 0 warnings.

## Validation

- `npm run validate` in `tools/ice-rink-local-seed`: passed, 3 page documents.
- `npm run validate:static:ice`: passed with 34 content-maturity warnings.
- `npm run validate:static:roller`: passed with 31 warnings; Roller remains paused.
- `npm run type-check`: passed.
- `npm run build:static:ice`: passed with warnings; Next auto-detected `.env.local`, so the build proof remains caveated.
- `node scripts/static-publish.mjs generate`: passed; cleaned excluded draft-preview output paths.
- `validate-static-output`: passed, 0 errors, 0 warnings.
- `validate-staging-package`: passed, 0 errors, 0 warnings.
- Runtime QA: passed, run ID `runtimeqa_3bb02639b61fe9d9`.
- Resource Registry operational bindings: passed, 0 failures, 0 warnings.
- OLM provider profile check: passed, `liveWriteAllowed: false`.

## Remaining Gates

Ice is local preflight-ready for route/static artifact validation, but deployment is still not approved.

Still closed:

- deployment
- DNS
- Search Console/indexing
- live publication
- CMS writes
- provider writes
- production migration
- Azure mutation
- RBAC assignment
- external crawling or live outbound URL checks
- keys/listKeys, connection strings, and SAS

Protected config caveat: no protected config file was manually opened or printed, but Next reported `.env.local` auto-detection during build. V2.8.3 should prepare a sanitized no-dotenv build/runtime QA evidence package before any staging publish approval worksheet.

Exact next approval wording is in:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-2-ice-static-source-route-repair-result/next-phase-prompt.md
```

Exact-path commit instructions:

```text
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_1_LOCAL_PREFLIGHT_REPORT.md
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_2_ICE_STATIC_SOURCE_ROUTE_REPAIR_REPORT.md
git add PUMPKIN_PLATFORM_SOURCE_OF_TRUTH.md
git add PUMPKIN_PLATFORM_TRACKER.md
git add PUMPKIN_PLATFORM_ACTIVE_BLOCKERS_AND_GATES.md
git add PUMPKIN_PLATFORM_CANONICAL_DOC_INDEX.md
git add deployment/architecture/tenant-website-publish-readiness/v2-8-1-local-preflight-result/
git add deployment/architecture/tenant-website-publish-readiness/v2-8-2-ice-static-source-route-repair-result/
git add tools/ice-rink-local-seed/README.md
git add tools/ice-rink-local-seed/scripts/validate-seed.mjs
git add tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/theme.json
git add tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/home.json
git add tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/contact.json
git add tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/service-areas.json
git add tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/ice-rink-rentals.json
git add tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/events-holiday-activations.json
git commit -m "Repair Ice static route source readiness"
```
