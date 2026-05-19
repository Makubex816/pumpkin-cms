# Pumpkin Static Publish Dry Run Phase 5E Report

## Executive Summary

Phase 5E added a repeatable local production static publish dry run for the Option C static-first workflow. The dry run builds both public sites, validates both outputs, copies upload-ready folders into an ignored release directory, and writes a machine-readable manifest plus a human-readable summary.

No Azure deployment was performed. No Cloudflare settings were changed. No production credentials, API keys, tokens, connection strings, or secrets were added.

## Files Changed

- `.gitignore`
- `apps/ice-rink-web/package.json`
- `deployment/static-azure/README.md`
- `deployment/static-azure/scripts/static-publish-dry-run.mjs`
- `deployment/static-azure/static-release-checklist.md`
- `PUMPKIN_STATIC_PUBLISH_DRY_RUN_PHASE5E_REPORT.md`

## Dry-Run Command

From `apps/ice-rink-web`:

```powershell
npm run publish:dry-run
```

Equivalent repo-root command:

```powershell
node deployment/static-azure/scripts/static-publish-dry-run.mjs
```

The script is Windows-compatible and invokes npm through `cmd.exe` on Windows.

## Artifacts Generated

Dry-run artifacts are generated under an ignored repo-root folder:

```text
.static-release-dry-runs/
```

Successful run:

```text
.static-release-dry-runs/2026-05-18-2234/
```

Generated upload roots:

```text
.static-release-dry-runs/2026-05-18-2234/ice-rink-rentals/
.static-release-dry-runs/2026-05-18-2234/roller-rink-rentals/
```

Generated metadata:

```text
.static-release-dry-runs/2026-05-18-2234/static-publish-dry-run-manifest.json
.static-release-dry-runs/2026-05-18-2234/STATIC_PUBLISH_DRY_RUN_SUMMARY.md
```

Zip files were not generated. The package format is an upload-ready folder per site, which keeps the dry run dependency-free and easy to inspect.

## Validation Results

Normal runtime build:

- `npm run build`: passed
- Runtime mode still includes `/api/contact` as a dynamic route.

Explicit static exports:

- `npm run export:static:ice`: passed
- `npm run export:static:roller`: passed

Standalone validators:

- Ice validator: passed with `43` files
- Roller validator: passed with `41` files

Dry-run script:

- `npm run publish:dry-run`: passed
- source output validation: passed for both sites
- copied release-folder validation: passed for both sites
- required route checks: passed for both sites
- sitemap canonical checks: passed for both sites
- forbidden env/appsettings checks: passed for both sites
- high-confidence secret scan: passed for both sites

## Ice Output Summary

- Site key: `ice-rink-rentals`
- Domain: `iceskatingrinkrentals.com`
- Upload root: `.static-release-dry-runs/2026-05-18-2234/ice-rink-rentals`
- File count: `43`
- Total bytes: `2106100`
- Ready for manual upload: `yes`

Expected routes present:

- `/`
- `/ice-rink-rentals`
- `/events-holiday-activations`
- `/contact`
- `/sitemap.xml`
- `/robots.txt`

Sitemap URLs all use:

```text
https://iceskatingrinkrentals.com
```

Content warning:

- One localhost reference was detected in a Next/React polyfill chunk. This was recorded as a content warning, not a secret-scan error.

## Roller Output Summary

- Site key: `roller-rink-rentals`
- Domain: `rollerrinkrentals.com`
- Upload root: `.static-release-dry-runs/2026-05-18-2234/roller-rink-rentals`
- File count: `41`
- Total bytes: `2019960`
- Ready for manual upload: `yes`

Expected routes present:

- `/`
- `/roller-rink-rentals`
- `/contact`
- `/sitemap.xml`
- `/robots.txt`

Sitemap URLs all use:

```text
https://rollerrinkrentals.com
```

Content warnings:

- Roller output still contains local-proof copy references.
- Roller output still contains local localhost references in rendered content.
- A localhost reference was also detected in a Next/React polyfill chunk.

These are content-readiness warnings, not deployment execution failures. They should be reviewed before a real production launch.

## Secret-Scan Summary

The dry-run script scanned release folders for:

- `.env` and `.env.*` files
- `appsettings.*.json` files
- private key markers
- Azure Storage connection string markers
- development storage markers
- selected local service URLs
- common API token patterns
- assigned secret-looking values

Result:

- Ice: passed, no secret-scan errors
- Roller: passed, no secret-scan errors
- generated manifest/summary are ignored and contain no secret values

## Deployment Readiness Status

The dry-run package is structurally ready for manual inspection and future deployment upload:

- Azure Static Web Apps: use each per-site folder as the prebuilt app artifact/root.
- Azure Storage static website: upload each per-site folder contents to the matching `$web` container.
- Cloudflare: verify DNS/cache rules and purge only after a future successful upload.

The new release checklist is:

```text
deployment/static-azure/static-release-checklist.md
```

## What Is Still Not Deployed

- No Azure resources were created.
- No Azure Static Web Apps upload was performed.
- No Azure Storage upload was performed.
- No Cloudflare DNS, cache, WAF, or purge changes were made.
- No production form endpoint was deployed.
- No active GitHub Actions workflows were added.

## Checks Run

- `node --check deployment/static-azure/scripts/static-publish-dry-run.mjs`: passed
- package JSON parse check: passed
- `npm run build` in `apps/ice-rink-web`: passed
- `npm run export:static:ice` in `apps/ice-rink-web`: passed
- `npm run export:static:roller` in `apps/ice-rink-web`: passed
- `node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out`: passed
- `node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out`: passed
- `npm run publish:dry-run` in `apps/ice-rink-web`: passed
- `git diff --check`: passed
- trailing-whitespace scan for Phase 5E changed files: passed
- generated dry-run artifact ignore check: passed
- `.github/workflows` active workflow check: no workflow directory present
- targeted high-confidence secret-pattern scan over changed docs/package/manifest/summary: passed
- targeted high-confidence secret-value scan over the dry-run script outside scanner pattern definitions: passed

## Next Recommended Phase

Phase 5F should be a deployment target decision and staging rehearsal:

- choose Azure Static Web Apps or Azure Storage static website for first staging deploy
- decide whether to clean local-proof copy before production launch
- configure a real static form endpoint in staging
- add deployment automation only after secrets are stored outside the repo
- run a manual staging upload and post-deploy verification without enabling aggressive Cloudflare HTML caching
