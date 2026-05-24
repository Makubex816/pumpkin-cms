# Pumpkin CMS Phase 7I - Final Static Regeneration / Theme Source Rescan

Date: 2026-05-24

Branch: `feature/admin-page-editor-import-export`

## Summary

Phase 7I regenerated fresh CMS-sourced static packages for Ice Skating Rink Rentals and Roller Rink Rentals after the manual Phase 7H-Retry theme patch was expected to be complete.

Fresh run ID:

- `2026-05-23-2220`

Result:

- Ice package generated successfully.
- Roller package generated successfully.
- Static artifact validators passed for both sites.
- Staging package validators passed for both sites.
- Dry-run manifest marks both sites `readyForManualUpload: true`.
- The repaired Roller generated routes remain clean for the old local-proof/local-dev/proof route copy.
- Blocker: the fresh Roller CMS source snapshot still contains `Local proof theme for Roller Rink Rentals.` in `theme.json`.
- A read-only public CMS theme verification also still found the old phrase and did not find `Production theme for Roller Rink Rentals.`

No CMS Theme data was patched in this phase. No CMS Page data was patched. No seed tool was run.

## Starting State

`git status --short --untracked-files=all` was clean at the start of Phase 7I.

Reviewed reports:

- `PUMPKIN_LIVE_ROLLER_THEME_PATCH_RETRY_PHASE7H_REPORT.md`
- `PUMPKIN_FINAL_STATIC_REGENERATION_PHASE7F_REPORT.md`
- `PUMPKIN_ROLLER_THEME_METADATA_CLEANUP_PHASE7G_REPORT.md`

Phase 7H-Retry reported that the live Roller theme patch had been completed manually and Phase 7I should regenerate and rescan. Phase 7F provided the previous final regeneration baseline. Phase 7G documented that the committed Roller seed theme source was clean but the live CMS theme had still required an authenticated admin update.

## Protected Config / Secret Handling

`apps/ice-rink-web/.env.local` was read only for the approved purpose of loading these five variables into the current process:

- `PUMPKIN_API_URL`
- `ICE_RINK_RENTALS_API_KEY`
- `ROLLER_RINK_RENTALS_API_KEY`
- `ICE_RINK_RENTALS_TENANT_ID`
- `ROLLER_RINK_RENTALS_TENANT_ID`

Only `PRESENT` / `MISSING` status was printed. No secret values, API keys, or JWTs were printed, copied into this report, staged, or committed.

Status:

- `PUMPKIN_API_URL`: PRESENT
- `ICE_RINK_RENTALS_API_KEY`: PRESENT
- `ROLLER_RINK_RENTALS_API_KEY`: PRESENT
- `ICE_RINK_RENTALS_TENANT_ID`: PRESENT
- `ROLLER_RINK_RENTALS_TENANT_ID`: PRESENT

Protected files were not modified:

- `apps/ice-rink-web/.env.local`
- `apps/pumpkin-api/appsettings.Development.json`

## Commands Run

From `apps/ice-rink-web` after loading the approved current-process variables:

```powershell
npm run snapshot:cms:ice
npm run validate:snapshot:ice
npm run export:static:ice:cms
npm run snapshot:cms:roller
npm run validate:snapshot:roller
npm run export:static:roller:cms
npm run publish:dry-run:cms
```

From the repo root:

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out "apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out"
node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out "apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out"
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder ".static-release-dry-runs/2026-05-23-2220/ice-rink-rentals"
node deployment/static-azure/validate-staging-package.mjs --site roller-rink-rentals --folder ".static-release-dry-runs/2026-05-23-2220/roller-rink-rentals"
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out ".static-release-dry-runs/2026-05-23-2220/ice-rink-rentals"
node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out ".static-release-dry-runs/2026-05-23-2220/roller-rink-rentals"
```

Read-only CMS theme verification:

```text
GET /api/themes/roller-rink-rentals/roller-rink-rentals-default
```

The read-only request returned HTTP 200.

## Generated Local Folders

Fresh CMS snapshots:

- `apps/ice-rink-web/.static-content-snapshots/ice-rink-rentals`
- `apps/ice-rink-web/.static-content-snapshots/roller-rink-rentals`

Fresh static artifacts:

- `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out`
- `apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out`

Fresh dry-run release folders:

- `.static-release-dry-runs/2026-05-23-2220/ice-rink-rentals`
- `.static-release-dry-runs/2026-05-23-2220/roller-rink-rentals`

These are generated local outputs and should not be committed.

## Ice Results

Fresh package:

- Site key: `ice-rink-rentals`
- Static artifact file count: 44
- Release package file count: 44
- Dry-run `readyForManualUpload`: `true`
- Redirect count: 0

Validator results:

- CMS snapshot validation: passed with warnings only.
- Static artifact validator: passed.
- Staging package validator: passed.
- Release static output validator: passed.

Page-quality warning count:

- Phase 6Z baseline: 40
- Phase 7D: 8
- Phase 7F: 8
- Phase 7I actual: 8
- Warnings resolved since Phase 6Z: 32

Remaining Ice page-quality warning categories:

| Category | Count | Affected routes |
| --- | ---: | --- |
| Manual workflow approval missing | 4 | `contact`, `events-holiday-activations`, `home`, `ice-rink-rentals` |
| `staticPublishing.needsRebuild` is true | 4 | `contact`, `events-holiday-activations`, `home`, `ice-rink-rentals` |

Ice content warning:

- One possible `localhost` reference remains in generated framework bundle `_next/static/chunks/polyfills-42372ed130431b0a.js`.
- This did not fail the static or staging validators.

## Roller Results

Fresh package:

- Site key: `roller-rink-rentals`
- Static artifact file count: 42
- Release package file count: 42
- Dry-run `readyForManualUpload`: `true`
- Redirect count: 0

Validator results:

- CMS snapshot validation: passed with warnings only.
- Static artifact validator: passed.
- Staging package validator: passed.
- Release static output validator: passed.

Page-quality warning count:

- Phase 6Z baseline: 30
- Phase 7D: 6
- Phase 7F: 6
- Phase 7I actual: 6
- Warnings resolved since Phase 6Z: 24

Remaining Roller page-quality warning categories:

| Category | Count | Affected routes |
| --- | ---: | --- |
| Manual workflow approval missing | 3 | `contact`, `home`, `roller-rink-rentals` |
| `staticPublishing.needsRebuild` is true | 3 | `contact`, `home`, `roller-rink-rentals` |

Roller content warning:

- One possible `localhost` reference remains in generated framework bundle `_next/static/chunks/polyfills-42372ed130431b0a.js`.
- This did not fail the static or staging validators.

## Warning Comparison

| Site | Phase 6Z warnings | Phase 7D warnings | Phase 7F warnings | Phase 7I warnings | Delta from 6Z |
| --- | ---: | ---: | ---: | ---: | ---: |
| Ice | 40 | 8 | 8 | 8 | -32 |
| Roller | 30 | 6 | 6 | 6 | -24 |

The Phase 7I page-quality warning counts remain at the post-repair manual approval/rebuild-only level.

## Roller Source Snapshot Scan

Targeted terms:

- `Local proof theme for Roller Rink Rentals.`
- `local-proof`
- `local proof`
- `local-dev`
- `local dev`
- `localhost`
- `staging-only`
- `placeholder`
- `test`
- `proof`

Fresh Roller CMS source snapshot:

| Term | Result |
| --- | --- |
| `Local proof theme for Roller Rink Rentals.` | 1 match in `theme.json` |
| `local-proof` | 0 |
| `local proof` | 1 match in `theme.json` |
| `local-dev` | 0 |
| `local dev` | 0 |
| `localhost` | 0 |
| `staging-only` | 0 |
| `placeholder` | 18 matches in `pages/contact.json`, all form field placeholder properties |
| `test` | 9 matches across page JSON rollback/template metadata, not user-facing test copy |
| `proof` | 1 match in `theme.json` |

Roller theme metadata result:

- Fresh source snapshot path: `apps/ice-rink-web/.static-content-snapshots/roller-rink-rentals/theme.json`
- Old theme phrase gone from fresh source snapshot: no
- Replacement phrase present in fresh source snapshot: no
- Read-only public CMS theme check: old phrase present, replacement phrase absent

This means the expected manual live CMS theme patch was not reflected in the CMS source used by the fresh snapshot.

## Roller Generated Package Scan

Fresh Roller generated package:

- `.static-release-dry-runs/2026-05-23-2220/roller-rink-rentals`

| Term | Result |
| --- | --- |
| `Local proof theme for Roller Rink Rentals.` | 0 |
| `local-proof` | 0 |
| `local proof` | 0 |
| `local-dev` | 0 |
| `local dev` | 0 |
| `localhost` | 1 match in `_next/static/chunks/polyfills-42372ed130431b0a.js` |
| `staging-only` | 0 |
| `placeholder` | 77 matches; expected contact form placeholder attributes/serialized props plus framework/static CSS references |
| `test` | 112 matches; generated route hits are serialized Next/template or `latestSnapshot` metadata, with the rest in framework/static chunks |
| `proof` | 0 |

Framework-bundle / non-user-facing noise:

- `localhost`: one generated polyfills chunk match.
- `test`: framework chunks and serialized Next/template or `latestSnapshot` metadata in generated HTML/text.
- `placeholder`: expected contact form placeholder attributes and generated framework/static CSS references.

The generated Roller package does not contain the old full theme phrase, `local-proof`, `local proof`, `local-dev`, `local dev`, `staging-only`, or `proof`.

## Repaired Roller Route Verification

Fresh generated route files checked:

- `/` -> `.static-release-dry-runs/2026-05-23-2220/roller-rink-rentals/index.html`
- `/contact` -> `.static-release-dry-runs/2026-05-23-2220/roller-rink-rentals/contact/index.html`
- `/roller-rink-rentals` -> `.static-release-dry-runs/2026-05-23-2220/roller-rink-rentals/roller-rink-rentals/index.html`

Route results:

| Route | Result |
| --- | --- |
| `/` | Clean for old full theme phrase, local-proof/local-dev/localhost/staging-only/proof; `test` only appears in serialized Next/template or `latestSnapshot` metadata |
| `/contact` | Clean for old full theme phrase, local-proof/local-dev/localhost/staging-only/proof; `placeholder` appears only as expected contact form placeholders; `test` only appears in serialized Next/template or `latestSnapshot` metadata |
| `/roller-rink-rentals` | Clean for old full theme phrase, local-proof/local-dev/localhost/staging-only/proof; `test` only appears in serialized Next/template or `latestSnapshot` metadata |

## Readiness Decisions

Azure default-host staging readiness:

- Limited technical staging readiness: yes, both fresh release folders passed validators and are marked `readyForManualUpload: true`.
- Final clean-source staging readiness: no, because the fresh Roller CMS source snapshot still contains the old local-proof theme metadata.
- No Azure resource creation, upload, deployment, or token work was performed.

Production cutover readiness:

- Not ready.
- The live CMS/source-snapshot theme metadata blocker remains.
- Public pages still require explicit workflow approval.
- `staticPublishing.needsRebuild` remains true on the public pages.

Remaining warnings are not production-blocking for generated page output, but they are production governance blockers until the source metadata, workflow approval, and rebuild state are resolved.

## Required Follow-Up

Before another final static regeneration:

1. Re-open Phase 7H-Retry or create a focused follow-up to patch only the live CMS Roller theme description.
2. Verify read-only public theme `GET /api/themes/roller-rink-rentals/roller-rink-rentals-default` no longer contains `Local proof theme for Roller Rink Rentals.`
3. Re-run Phase 7I static regeneration and source/package scans.

## Checks

Completed:

- Static artifact validators: passed for Ice and Roller.
- Staging package validators: passed for Ice and Roller.
- Release static output validators: passed for Ice and Roller.
- Relevant CMS/theme validation: read-only public theme GET returned HTTP 200 and confirmed the old phrase still remains.
- `git diff --check`: passed.
- Direct trailing whitespace scan for this report: passed.
- Protected config/workflow/generated-folder status check: passed.
- Targeted secret scan for this report: passed.
- No generated static folders staged: passed.
- `node --check` for changed `.mjs` files: not applicable; no `.mjs` files changed.

## No-Go Confirmations

- No CMS Theme data was patched.
- No CMS Page records were changed.
- No seed upsert was run.
- No generated static output folders were directly edited.
- Generated snapshots/artifacts/dry-run folders were created by generation commands only and must not be committed.
- No production pages were created.
- No provider/state/company research files were created.
- No hard delete was performed.
- No real emails were sent.
- No Azure resource was created.
- No Azure deployment was run.
- No Cloudflare or DNS change was made.
- No active GitHub Actions workflow was created.
- `apps/ice-rink-web/.env.local` was read only for the five allowed local variables and was not modified.
- `apps/pumpkin-api/appsettings.Development.json` was not read or modified.
