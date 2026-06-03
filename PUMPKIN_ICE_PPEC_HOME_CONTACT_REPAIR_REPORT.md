# Pumpkin Ice PPEC Home/Contact Repair Report

Generated: 2026-06-03T13:34:07.633Z

## Start State

Branch: `feature/admin-page-editor-import-export`

Git status at start:

```
 M apps/pumpkin-api/Services/PageRevisionHelper.cs
 M packages/pumpkin-ts-models/src/models/Page.ts
?? content-review/ice-ppec-home-contact-repair/ppec-rg-hits.txt
```

Recent log at start:

```
f853b44 Add Ice updated home contact post repair reimport report
4dc63e7 Repair updated Ice home contact contract persistence
2c0b20c Add Ice updated home contact local draft import report
7206de9 Add admin auth diagnostic tooling
6eae0c9 Add Ice updated home contact draft import auth blocker report
2f4bb29 Add Ice updated home contact package intake
02fd805 Repair Pumpkin page contract persistence models
01a37ef Repair Phase 8N homepage contract persistence
97ddf11 Add Phase 8N homepage local draft overwrite report
34eef51 Fix Phase 8N homepage overwrite route guard
e2d150b Add Ice homepage Phase 8N scaffold validation package
e465511 Add Ice homepage draft preview and production rendering support
```

Local services checked:

- `http://localhost:5064/`: 200
- `http://localhost:3002/__preview/ice-rink-rentals/home`: 200
- `http://localhost:3002/contact`: 200

## Source Audit

PPEC source exists in the validated home/contact package and in CMS readback artifacts. The requested raw input folder is missing locally, but validated package metadata points to `ice-site-phase10a-pumpkin-ppec-rewrite-pack`.

Important source files:

- `content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json`
- `content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json`
- `content-review/ice-updated-home-contact-post-repair-reimport/homepage-readback-after-post-repair-import.json`
- `content-review/ice-updated-home-contact-post-repair-reimport/contact-readback-after-post-repair-import.json`

Detailed audit: `content-review/ice-ppec-home-contact-repair/PPEC_SOURCE_AUDIT.md`.

## Root Cause

Classification: G primary, C contributing.

PPEC was already in normalized candidates and readbacks. The terminal route checks did not show it because the homepage draft preview is a JWT-gated client shell and public `/contact` is not authenticated draft content. The validator also had a false-positive guard that treated the partner name `Party Pros East Coast` like generic service-area wording.

Detailed root cause: `content-review/ice-ppec-home-contact-repair/PPEC_ROOT_CAUSE.md`.

## Validator Review

Patched `tools/import-preflight/import-preflight.mjs` so the exact partner brand phrase is allowed while any remaining generic `East Coast` wording still fails.

Proof:

- PPEC candidate passes `production-service-area-copy`.
- Negative fixture with generic `Serving event routes across the East Coast` fails `production-service-area-copy`.

## Candidate Changes

Homepage candidate:

- Added repaired PPEC CTA block id `homepage-ppec-partner-cta`.
- Uses `PrimaryCTA` with `partnerCta` marker.
- CTA text: `Explore Party Pros East Coast`.
- Link: `https://partyproseastcoast.com/`.

Contact candidate:

- Preserves primary `formBlock` with `default-quote-request`.
- Adds repaired PPEC CTA block id `contact-ppec-partner-cta`.
- Keeps PPEC FAQ from the source candidate.

Candidate files:

- `content-review/ice-ppec-home-contact-repair/UPDATED_HOMEPAGE_WITH_PPEC_CANDIDATE.json`
- `content-review/ice-ppec-home-contact-repair/UPDATED_CONTACT_WITH_PPEC_CANDIDATE.json`
- `content-review/ice-ppec-home-contact-repair/UPDATED_HOME_CONTACT_WITH_PPEC_PACKAGE.json`

## Validation Results

Passed:

- JSON parse.
- Import preflight for homepage/contact, valid for local draft import.
- .NET updated home/contact contract, with production-field persistence and updated home/contact persistence true.
- Design-system, media, default-form, Tailwind/navigation, and page-intake normalizer fixtures.
- TypeScript model check.
- Unsafe payload scan, targeted secret scan, protected/generated/raw path check, trailing whitespace scan, and `git diff --check`.

Warnings are review-only metadata warnings plus the expected homepage no-formBlock warning.

Detailed validation: `content-review/ice-ppec-home-contact-repair/VALIDATION_RESULTS.md`.

## CMS Draft Update

Not performed.

Admin auth check showed no `PUMPKIN_ADMIN_JWT` env var and no temp JWT file. Token contents were not read or printed.

## Preview Result

Raw route checks returned 200, but PPEC was not in terminal HTML. That is expected for the JWT-gated homepage preview shell and public contact route.

Detailed checklist: `content-review/ice-ppec-home-contact-repair/FRONTEND_PREVIEW_CHECKLIST.md`.

## Remaining Blockers

- Fresh admin auth is required to import these candidates into local CMS drafts.
- New repair candidates have not been read back from CMS because no write occurred.
- Human approval is still required before production approval/publish.

Guardrails honored:

- No deploy.
- No static regeneration.
- No publish or production approval.
- No /service-areas update.
- No /state-city creation.
- No Theme or MediaAsset record update.
- No protected config read.
- No email/provider/DNS action.
- Roller remains paused.

## Next Recommended Action

Provide fresh local admin auth in this terminal session and run the local draft import for `UPDATED_HOMEPAGE_WITH_PPEC_CANDIDATE.json` and `UPDATED_CONTACT_WITH_PPEC_CANDIDATE.json`, then perform authenticated draft readback and browser preview verification.
