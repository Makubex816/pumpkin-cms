# Pumpkin CMS Phase 7D: Post-Repair Static Regeneration Report

## Summary

Phase 7D regenerated fresh Ice and Roller static packages from repaired CMS source content after Phase 7C page-quality source repairs.

Fresh run ID:

- `2026-05-22-1321`

Result:

- Ice fresh static package generated and validators passed.
- Roller fresh static package generated and validators passed.
- Page-quality warning counts matched the Phase 7C no-output estimate.
- Technical Azure default-host staging review can proceed from this package.
- Production cutover should wait because remaining manual approval/rebuild markers still need final operator action, and Roller still contains local-proof/local-dev copy warnings in the fresh generated package.

No Azure, Cloudflare, DNS, deployment, email, provider research, state research, production page creation, hard delete, or active workflow action was performed.

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
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder ".static-release-dry-runs/2026-05-22-1321/ice-rink-rentals"
node deployment/static-azure/validate-staging-package.mjs --site roller-rink-rentals --folder ".static-release-dry-runs/2026-05-22-1321/roller-rink-rentals"
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out ".static-release-dry-runs/2026-05-22-1321/ice-rink-rentals"
node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out ".static-release-dry-runs/2026-05-22-1321/roller-rink-rentals"
```

## Generated Local Folders

Fresh CMS snapshots:

- `apps/ice-rink-web/.static-content-snapshots/ice-rink-rentals`
- `apps/ice-rink-web/.static-content-snapshots/roller-rink-rentals`

Fresh static artifacts:

- `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out`
- `apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out`

Fresh dry-run release folders:

- `.static-release-dry-runs/2026-05-22-1321/ice-rink-rentals`
- `.static-release-dry-runs/2026-05-22-1321/roller-rink-rentals`

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
- Phase 7C estimate: 8
- Phase 7D actual: 8
- Warnings resolved since Phase 6Z: 32

Remaining Ice page-quality warning categories:

| Category | Count | Affected routes |
| --- | ---: | --- |
| Manual workflow approval missing | 4 | `contact`, `events-holiday-activations`, `home`, `ice-rink-rentals` |
| `staticPublishing.needsRebuild` is true | 4 | `contact`, `events-holiday-activations`, `home`, `ice-rink-rentals` |

Ice dry-run content warning:

- One possible localhost reference was reported in the generated Next.js polyfills chunk.
- This did not fail the static validators, but it should be reviewed during staging browser smoke testing.

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
- Phase 7C estimate: 6
- Phase 7D actual: 6
- Warnings resolved since Phase 6Z: 24

Remaining Roller page-quality warning categories:

| Category | Count | Affected routes |
| --- | ---: | --- |
| Manual workflow approval missing | 3 | `contact`, `home`, `roller-rink-rentals` |
| `staticPublishing.needsRebuild` is true | 3 | `contact`, `home`, `roller-rink-rentals` |

Roller dry-run content warnings:

- Roller still has local-proof/local-dev copy in the fresh generated release and fresh CMS snapshot.
- Affected generated routes include `contact`, `home`, and `roller-rink-rentals`.
- Examples include local proof request copy, local proof validation copy, and `roller.localhost:3002` references.

This means Phase 7C reduced the page-quality warning count as expected, but it did not fully remove Roller local-proof/local-dev copy from source content. This remains production-blocking.

## Warning Comparison

| Site | Phase 6Z warnings | Phase 7C estimate | Phase 7D actual | Delta from 6Z |
| --- | ---: | ---: | ---: | ---: |
| Ice | 40 | 8 | 8 | -32 |
| Roller | 30 | 6 | 6 | -24 |

The Phase 7D actual page-quality counts matched the Phase 7C no-output estimates.

## Remaining Warnings

Expected remaining page-quality warnings:

- Manual workflow approval still required for intended public pages.
- `staticPublishing.needsRebuild` remains true after source repairs and regeneration.

Additional content warnings:

- Ice has a possible localhost reference in a generated framework chunk.
- Roller has user-facing local-proof/local-dev copy in generated page output and source snapshot.

## Staging Readiness

Azure default-host staging manual upload can proceed for technical review using run `2026-05-22-1321` because:

- Ice and Roller static artifacts generated successfully.
- Ice and Roller staging package validators passed.
- The dry-run manifest marked both sites `readyForManualUpload: true`.
- No deployment or Cloudflare action occurred.

Staging review should explicitly check:

- Roller local-proof/local-dev copy.
- Contact page copy.
- Home page copy.
- Service page copy.
- Static form behavior.
- No exposed secrets.

## Production Readiness

Production cutover should wait.

Production blockers:

- Roller local-proof/local-dev content remains in fresh generated output and must be repaired at the CMS source-content level.
- Public pages still need explicit workflow approval.
- `staticPublishing.needsRebuild` should be cleared only after the final approved build/publish workflow records a clean state.

Non-blocking or review-only:

- Ice possible localhost reference in a generated polyfills chunk should be reviewed in staging, but it did not fail validators.

## Recommended Next Step

Run a focused Phase 7E source repair pass for Roller copy only:

- Replace local-proof/local-dev copy in Roller `contact`, `home`, and `roller-rink-rentals`.
- Re-run a no-output content scan.
- Regenerate static packages again after repairs.
- Keep production cutover blocked until the fresh Roller release has no user-facing local-proof/local-dev copy.

## Checks

Completed:

- `git diff --check`: passed.
- Direct trailing whitespace scan: passed.
- Protected config/workflow/generated-folder check: passed; no protected config or generated output folders are staged.
- Targeted secret scan: passed; matches were limited to safety wording and placeholder environment variable names in this report.
- Static artifact validators: passed for Ice and Roller.
- Staging package validators: passed for Ice and Roller.
- `node --check` for changed `.mjs` files: not applicable; no `.mjs` files were changed in Phase 7D.
