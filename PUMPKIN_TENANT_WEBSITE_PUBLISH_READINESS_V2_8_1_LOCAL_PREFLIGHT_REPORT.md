# Pumpkin Tenant Website Publish Readiness V2.8.1 Local Preflight Report

Status: complete local/read-only preflight; publish remains blocked.

Result package:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-1-local-preflight-result/
```

Tracker recommendation:

- Current reference: `V2.8.1`
- Current lane: `V2.8 Tenant Website / Publish Readiness`
- Provisional V2 overall completion: `86%`
- V2.8 completion: `62%`
- Layer refs: `L01`, `L02`, `L03`, `L04`, `L06`, `L07`, `L08`, `L09`, `L10`, `L11`, `L12`, `L15`
- Next recommended reference: `V2.8.2 Tenant Website static source refresh and sanitized publish package dry-run`

## What Is Complete

- Reviewed V2.7.2 Admin/API Operator Console signoff, V2.6.1 Runtime QA, V2.5.1 Resource Registry / Provider Profiles, V2.2.5 OLM final stage-ready signoff, Backup Center Phase 2F-14 proof, and relevant static/form/media docs.
- Inventoried tenant website app/source state.
- Classified IceSkatingRinkRentals.com as the active proof tenant.
- Classified RollerRinkRentals.com as paused.
- Ran local static/type/runtime/resource/OLM checks.
- Created the V2.8.1 result package and updated platform control docs.

## Readiness Result

Ice is not ready for publish from the current safe local seed-site path.

The current Ice seed-site source contains:

- `home`
- `contact`
- `ice-rink-rentals`
- `events-holiday-activations`

The current launch validator expects:

- `home`
- `contact`
- `service-areas`

So the current local source is blocked by missing `/service-areas` and obsolete `/ice-rink-rentals` plus `/events-holiday-activations`.

Historical Ice CMS-backed static proof from 2026-06-06 passed with `home`, `contact`, and `service-areas`, but V2.8.1 did not refresh that live CMS/API snapshot because this pass forbids protected config reads and live CMS/API access.

## Validation

- `npm run validate:static:ice`: failed as expected with route blockers.
- `npm run validate:static:roller`: passed with 31 warnings; Roller remains paused.
- `npm run type-check`: passed.
- `npm run build:static:ice`: passed with warnings; Next auto-detected `.env.local`, so the build proof is caveated.
- `validate-static-output` for Ice `out`: failed as expected.
- Runtime QA harness check: passed, 6 tests.
- Runtime QA evidence run: passed, run ID `runtimeqa_85a8b84955410b83`.
- Resource Registry operational binding validator: passed, 0 failures, 0 warnings.
- OLM provider profile check: passed, `liveWriteAllowed: false`.
- OLM current-session staging env contract: blocked, all 10 fields absent, package linkage passed.

## Gates

Deployment, DNS change, Search Console/indexing, live publication, CMS writes, provider writes, production migration, Azure mutation, RBAC assignment, keys/listKeys, connection strings, SAS generation, external crawling, and live outbound URL checks remain closed.

Protected config caveat: no protected config file was manually opened or printed, but the Next static build reported `.env.local` detection. Future build validation should use a sanitized workspace or approved no-dotenv pattern.

Exact next approval wording is in:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-1-local-preflight-result/next-phase-prompt.md
```

Exact-path commit instructions:

```text
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_1_LOCAL_PREFLIGHT_REPORT.md
git add PUMPKIN_PLATFORM_SOURCE_OF_TRUTH.md
git add PUMPKIN_PLATFORM_TRACKER.md
git add PUMPKIN_PLATFORM_ACTIVE_BLOCKERS_AND_GATES.md
git add PUMPKIN_PLATFORM_CANONICAL_DOC_INDEX.md
git add deployment/architecture/tenant-website-publish-readiness/v2-8-1-local-preflight-result/
git commit -m "Add tenant website publish readiness preflight"
```
