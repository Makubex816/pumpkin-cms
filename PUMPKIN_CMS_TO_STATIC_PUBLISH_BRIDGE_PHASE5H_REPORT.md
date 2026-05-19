# Pumpkin CMS To Static Publish Bridge - Phase 5H Report

## Summary

Phase 5H adds the local bridge needed to turn approved Pumpkin CMS content into static export input for the Option C static-first publishing workflow.

The existing seed-site static export path remains the default. CMS snapshot mode is opt-in with `STATIC_CONTENT_SOURCE=cms-snapshot`.

## Files Changed

- `apps/ice-rink-web/.gitignore`
- `apps/ice-rink-web/package.json`
- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs`
- `apps/ice-rink-web/scripts/static-publish.mjs`
- `apps/ice-rink-web/src/lib/static-content.ts`
- `deployment/static-azure/README.md`
- `deployment/static-azure/cms-to-static-publish-bridge.md`
- `deployment/static-azure/scripts/static-publish-dry-run.mjs`
- `PUMPKIN_CMS_TO_STATIC_PUBLISH_BRIDGE_PHASE5H_REPORT.md`

## Bridge Design

The bridge has three separate artifact layers:

- Cosmos/Pumpkin API: editable CMS source of truth.
- CMS snapshot JSON: generated static publish artifact.
- Static output: deployable public site artifact.

CMS snapshots are written to:

```text
apps/ice-rink-web/.static-content-snapshots/{SITE_KEY}/
```

The folder is ignored by git and should never be committed.

Snapshot shape:

- `manifest.json`
- `theme.json` when the active theme endpoint returns one
- `pages/*.json`

## Source Of Truth Model

- Cosmos/Pumpkin API remains the editable CMS store.
- JSON snapshots are generated from CMS content for publishing.
- Static export reads either seed-sites or CMS snapshots.
- Seed-sites remain bootstrap/developer content, not the intended live source once CMS publishing is active.

## Scripts Added

From `apps/ice-rink-web`:

```powershell
npm run snapshot:cms:ice
npm run snapshot:cms:roller
npm run validate:snapshot:ice
npm run validate:snapshot:roller
npm run export:static:ice:cms
npm run export:static:roller:cms
npm run publish:dry-run:cms
```

Existing seed-site scripts remain unchanged:

```powershell
npm run export:static:ice
npm run export:static:roller
npm run publish:dry-run
```

## Snapshot Behavior

The snapshot script uses `PUMPKIN_API_URL`, defaulting to `http://localhost:5064`.

Required per-site API key environment variables:

- `ICE_RINK_RENTALS_API_KEY`
- `ROLLER_RINK_RENTALS_API_KEY`

Optional admin JWT environment variables:

- `CMS_SNAPSHOT_ADMIN_TOKEN`
- `PUMPKIN_ADMIN_JWT`

Preferred local proof path:

- use an admin JWT to call `GET /api/admin/pages?tenantId={tenantId}`
- filter to published pages by default
- optionally include unpublished pages only with `--include-unpublished`

Fallback path when no admin JWT is present:

- call `GET /api/tenant/{tenantId}/sitemap`
- call `GET /api/pages/{tenantId}/{pageSlug}` for each sitemap entry
- warn that published pages excluded from sitemap may not be included

The script does not print API keys or write them to snapshot files.

## Validation Behavior

Snapshot validation checks:

- snapshot folder exists
- `pages/` exists
- no `.env` files
- no `appsettings.*.json` files
- no high-confidence secret-looking values
- no `CMS LIVE` marker
- `tenantId` matches the selected tenant
- `pageSlug` exists
- `ContentData.ContentBlocks` is an array
- `isPublished` and `includeInSitemap` are booleans
- unpublished pages are excluded unless explicitly allowed
- canonical URL uses the expected public domain when present

Static output validation continues to use `deployment/static-azure/validate-static-output.mjs`.

## Static Export Integration

`apps/ice-rink-web/src/lib/static-content.ts` now supports:

- `STATIC_CONTENT_SOURCE=seed-sites`
- `STATIC_CONTENT_SOURCE=cms-snapshot`
- `STATIC_CONTENT_DIR` fallback/custom source behavior

`apps/ice-rink-web/scripts/static-publish.mjs` can validate/generate artifacts from CMS snapshots.

`deployment/static-azure/scripts/static-publish-dry-run.mjs` can now package either:

- seed-site static exports with `npm run publish:dry-run`
- CMS snapshot static exports with `npm run publish:dry-run:cms`

## Static Export From CMS Snapshot Result

CMS snapshot export was not executed end-to-end in this environment because the shell did not expose the required tenant API key environment variables.

Clean failure was verified:

- `npm run snapshot:cms:ice` failed with missing `ICE_RINK_RENTALS_API_KEY`
- `npm run snapshot:cms:roller` failed with missing `ROLLER_RINK_RENTALS_API_KEY`

No credential values were printed.

## Dry-Run Integration Result

The default seed-site dry-run still works after making the dry-run script content-source aware.

`npm run publish:dry-run` produced a validated ignored release folder under `.static-release-dry-runs/` with:

- Ice ready for manual upload
- Roller ready for manual upload
- `contentSource: seed-sites`

CMS dry-run mode is wired through `npm run publish:dry-run:cms`, but it requires successful CMS snapshots first.

## Checks Run

Passed:

- `node --check apps/ice-rink-web/scripts/snapshot-cms-content.mjs`
- `node --check apps/ice-rink-web/scripts/static-publish.mjs`
- `node --check deployment/static-azure/scripts/static-publish-dry-run.mjs`
- `npm pkg get scripts --prefix apps/ice-rink-web`
- `npm run validate:static:ice`
- `npm run validate:static:roller`
- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npm run export:static:ice`
- `npm run export:static:roller`
- `node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out`
- `node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out`
- `npm run publish:dry-run`
- `git diff --check`
- trailing whitespace scan for new/updated docs
- targeted secret-pattern scan over changed files
- confirmation that no `.github/workflows`, `.env.local`, or `appsettings.Development.json` files were changed

Clean expected failures:

- `npm run snapshot:cms:ice`, missing local `ICE_RINK_RENTALS_API_KEY`
- `npm run snapshot:cms:roller`, missing local `ROLLER_RINK_RENTALS_API_KEY`

Secret scan note:

- Scanner regex definitions in the validation scripts contain strings such as `AccountKey=` as patterns to detect, but no actual secret values were found in changed files.

## Known Limitations

- Full CMS snapshot export requires local tenant API key environment variables.
- Complete published page discovery requires an admin JWT; otherwise the fallback can only discover sitemap-included pages.
- CMS snapshot static export was implemented but not end-to-end verified because local credentials were not present in the shell.
- No Azure deployment was performed.
- No Cloudflare changes were made.
- No active GitHub Actions workflows were added.

## Next Recommended Phase

Run a local CMS-backed publish proof with credentials loaded in the shell:

1. start Pumpkin API and Cosmos Emulator
2. set the tenant API key environment variables locally
3. optionally set `CMS_SNAPSHOT_ADMIN_TOKEN` for complete page-list discovery
4. run `npm run export:static:ice:cms`
5. run `npm run export:static:roller:cms`
6. run `npm run publish:dry-run:cms`
7. compare the CMS snapshot output against the latest admin-edited pages before Azure staging
