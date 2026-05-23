# Pumpkin CMS Phase 7F: Final Static Regeneration / Roller Copy Verification Report

## Summary

Phase 7F regenerated fresh Ice and Roller static packages from CMS source content after the Phase 7E Roller local-copy cleanup.

Fresh run ID:

- `2026-05-22-1704`

Result:

- Ice package generated successfully.
- Roller package generated successfully.
- Static artifact validators passed for both sites.
- Staging package validators passed for both sites.
- Dry-run manifest marks both sites `readyForManualUpload: true`.
- The three repaired Roller generated routes are clean for local-proof/local-dev/localhost/test/proof user-facing copy.

No Azure, Cloudflare, DNS, deployment, email, provider research, state research, production page creation, hard delete, or active workflow action was performed.

## Starting State

`git status --short` was clean at the start of Phase 7F.

Phase 7E had already repaired the Roller CMS source pages:

- `contact`
- `home`
- `roller-rink-rentals`

The previous `2026-05-22-1321` Roller generated package is stale and should not be used for content review.

## Protected Config / Secret Handling

`apps/ice-rink-web/.env.local` was read only for the limited approved purpose of loading these five variables into the current process:

- `PUMPKIN_API_URL`
- `ICE_RINK_RENTALS_API_KEY`
- `ROLLER_RINK_RENTALS_API_KEY`
- `ICE_RINK_RENTALS_TENANT_ID`
- `ROLLER_RINK_RENTALS_TENANT_ID`

Only `PRESENT` / `MISSING` status was printed. No secret values were printed, copied into this report, or committed.

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
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder ".static-release-dry-runs/2026-05-22-1704/ice-rink-rentals"
node deployment/static-azure/validate-staging-package.mjs --site roller-rink-rentals --folder ".static-release-dry-runs/2026-05-22-1704/roller-rink-rentals"
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out ".static-release-dry-runs/2026-05-22-1704/ice-rink-rentals"
node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out ".static-release-dry-runs/2026-05-22-1704/roller-rink-rentals"
```

## Generated Local Folders

Fresh CMS snapshots:

- `apps/ice-rink-web/.static-content-snapshots/ice-rink-rentals`
- `apps/ice-rink-web/.static-content-snapshots/roller-rink-rentals`

Fresh static artifacts:

- `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out`
- `apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out`

Fresh dry-run release folders:

- `.static-release-dry-runs/2026-05-22-1704/ice-rink-rentals`
- `.static-release-dry-runs/2026-05-22-1704/roller-rink-rentals`

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
- Phase 7F actual: 8
- Warnings resolved since Phase 6Z: 32

Remaining Ice page-quality warning categories:

| Category | Count | Affected routes |
| --- | ---: | --- |
| Manual workflow approval missing | 4 | `contact`, `events-holiday-activations`, `home`, `ice-rink-rentals` |
| `staticPublishing.needsRebuild` is true | 4 | `contact`, `events-holiday-activations`, `home`, `ice-rink-rentals` |

Ice content warning:

- One possible `localhost` reference remains in the generated Next.js polyfills chunk.
- This did not fail the static validators.

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
- Phase 7F actual: 6
- Warnings resolved since Phase 6Z: 24

Remaining Roller page-quality warning categories:

| Category | Count | Affected routes |
| --- | ---: | --- |
| Manual workflow approval missing | 3 | `contact`, `home`, `roller-rink-rentals` |
| `staticPublishing.needsRebuild` is true | 3 | `contact`, `home`, `roller-rink-rentals` |

Roller content warning:

- One possible `localhost` reference remains in the generated Next.js polyfills chunk.
- This did not fail the static validators.

## Warning Comparison

| Site | Phase 6Z warnings | Phase 7D warnings | Phase 7F warnings | Delta from 6Z |
| --- | ---: | ---: | ---: | ---: |
| Ice | 40 | 8 | 8 | -32 |
| Roller | 30 | 6 | 6 | -24 |

The Phase 7F page-quality warning counts remained at the post-repair manual approval/rebuild-only level.

## Roller Bad Phrase Scan

Targeted phrases:

- `local-proof`
- `local proof`
- `local-dev`
- `local dev`
- `localhost`
- `staging-only`
- `placeholder`
- `test`
- `proof`

Fresh Roller page source snapshot results:

- `local-proof`: 0
- `local proof`: 0 in Page JSON; 1 in `theme.json` metadata only: "Local proof theme for Roller Rink Rentals."
- `local-dev`: 0
- `local dev`: 0
- `localhost`: 0
- `staging-only`: 0
- `test`: 0
- `proof`: 0 in Page JSON; 1 in `theme.json` metadata only via the same theme description.
- `placeholder`: 18 in `contact.json`, all as form field property names.

Fresh Roller generated route output results for:

- `/`
- `/contact`
- `/roller-rink-rentals`

| Phrase | Route output result |
| --- | --- |
| `local-proof` | 0 |
| `local proof` | 0 |
| `local-dev` | 0 |
| `local dev` | 0 |
| `localhost` | 0 |
| `staging-only` | 0 |
| `test` | 0 |
| `proof` | 0 |
| `placeholder` | present only as expected contact form `placeholder` attributes / serialized form props |

Fresh Roller full package scan notes:

- `localhost`: 1 match in `_next/static/chunks/polyfills-42372ed130431b0a.js`.
- `test`: matches only in generated framework/static chunks.
- `placeholder`: matches in contact form attributes/serialized form props and generated static framework assets.
- No local-proof/local-dev/proof user-facing route copy remains in the fresh Roller generated pages.

## Repaired Roller Page Verification

The repaired generated routes are clean for the old user-facing local-proof/local-dev copy:

- `/`: clean.
- `/contact`: clean, except expected form `placeholder` attributes.
- `/roller-rink-rentals`: clean.

The remaining `theme.json` source-snapshot phrase is not emitted in the generated route output, but it should be cleaned up in CMS theme metadata before final governance sign-off.

## Staging Readiness

Azure default-host staging manual upload can proceed for technical and content review using run `2026-05-22-1704` because:

- Ice and Roller static artifacts generated successfully.
- Ice and Roller static validators passed.
- Ice and Roller staging package validators passed.
- Dry-run manifest marks both sites `readyForManualUpload: true`.
- The repaired Roller generated routes no longer contain the old local-proof/local-dev user-facing copy.
- No deployment or Cloudflare action occurred.

Staging review should still explicitly verify:

- Public route copy.
- Contact form behavior.
- Mobile rendering.
- No exposed secrets.
- The framework polyfills `localhost` warning is not user-facing.

## Production Cutover Readiness

Production cutover should still wait.

Remaining production blockers:

- Public pages still require explicit workflow approval.
- `staticPublishing.needsRebuild` remains true until the final approved build/publish workflow records a clean state.
- Roller `theme.json` still has non-rendered "Local proof theme" metadata and should be cleaned before final governance sign-off.

Not currently production-blocking for generated page output:

- Roller generated page routes are clean for the prior user-facing local-proof/local-dev copy.
- The remaining `localhost` warning is in a generated framework polyfills chunk and did not fail validators.
- `placeholder` matches are expected form field attributes/metadata, not placeholder marketing copy.

## Recommended Next Step

For staging:

- Use `.static-release-dry-runs/2026-05-22-1704` for Azure default-host manual upload review.

Before production cutover:

- Manually approve intended public pages in workflow metadata.
- Resolve or formally record the final static rebuild state.
- Clean Roller theme metadata description.
- Re-run final static package generation and validators after those source changes.

## Checks

Completed:

- `git diff --check`: passed.
- Direct trailing whitespace scan: passed.
- Protected config/workflow/generated-folder check: passed; no protected config or generated output folders are staged.
- Targeted secret scan: passed; matches were limited to safety wording and placeholder environment variable names in this report.
- Confirm generated static folders are not staged: passed.
- Static artifact validators: passed for Ice and Roller.
- Staging package validators: passed for Ice and Roller.
- `node --check` for changed `.mjs` files: not applicable; no `.mjs` files were changed in Phase 7F.
