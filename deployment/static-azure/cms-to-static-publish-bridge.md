# CMS To Static Publish Bridge

Phase 5H adds a local bridge between Pumpkin CMS content and the Option C static publishing workflow.

The bridge does not deploy anything. It snapshots approved CMS content into generated JSON files that the existing static export mode can render.

## Source Of Truth Model

- Cosmos/Pumpkin API is the editable CMS store.
- `apps/ice-rink-web/.static-content-snapshots/{SITE_KEY}/` is a generated publish snapshot.
- `apps/ice-rink-web/.static-artifacts/{SITE_KEY}/out/` is the generated static site output.
- `.static-release-dry-runs/` is the local dry-run release package.
- `tools/ice-rink-local-seed/seed-sites/` remains developer/bootstrap content and the default static source.

Once CMS publishing is active, seed-sites should not be treated as the live content source.

## Snapshot Folder

CMS snapshots are generated under:

```text
apps/ice-rink-web/.static-content-snapshots/{SITE_KEY}/
```

Expected snapshot shape:

```text
.static-content-snapshots/
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

The snapshot folder is ignored by git and must not be committed.

## Required Local Environment

The snapshot script reads server-side environment variables from the shell running the command:

- `PUMPKIN_API_URL`, optional, defaults to `http://localhost:5064`
- `ICE_RINK_RENTALS_TENANT_ID`, optional when tenant id equals the site key
- `ICE_RINK_RENTALS_API_KEY`, required for Ice snapshots
- `ROLLER_RINK_RENTALS_TENANT_ID`, optional when tenant id equals the site key
- `ROLLER_RINK_RENTALS_API_KEY`, required for Roller snapshots
- `CMS_SNAPSHOT_ADMIN_TOKEN` or `PUMPKIN_ADMIN_JWT`, optional for complete local page-list discovery

The script does not print API keys and does not write API keys to snapshot files.

## Snapshot CMS Content

From `apps/ice-rink-web`:

```powershell
npm run snapshot:cms:ice
npm run snapshot:cms:roller
```

Default behavior snapshots published pages only by calling:

- `GET /api/themes/{tenantId}`

When `CMS_SNAPSHOT_ADMIN_TOKEN` or `PUMPKIN_ADMIN_JWT` is available, the script also calls:

- `GET /api/admin/pages?tenantId={tenantId}`

and filters to published pages by default. This is the preferred local proof path because it can discover all published pages for the tenant.

When no admin JWT is available, the script falls back to API-key sitemap discovery:

- `GET /api/tenant/{tenantId}/sitemap`
- `GET /api/pages/{tenantId}/{pageSlug}`

That fallback can only discover pages that are both published and included in the sitemap.

For local testing only, the script can include unpublished pages when an admin JWT is supplied in `CMS_SNAPSHOT_ADMIN_TOKEN` or `PUMPKIN_ADMIN_JWT`:

```powershell
$env:SITE_KEY = 'ice-rink-rentals'
node scripts/snapshot-cms-content.mjs snapshot --include-unpublished
```

Do not use unpublished snapshots for public static release packages.

## Validate Snapshots

From `apps/ice-rink-web`:

```powershell
npm run validate:snapshot:ice
npm run validate:snapshot:roller
```

Validation checks:

- snapshot folder and pages exist
- no `.env` files
- no `appsettings.*.json` files
- no high-confidence secret-looking strings
- page `tenantId` matches the selected tenant
- `pageSlug` exists
- `ContentData.ContentBlocks` is an array
- `isPublished` and `includeInSitemap` are booleans
- unpublished pages are excluded by default
- canonical URLs match the expected public domain when present

## Static Export From CMS Snapshot

From `apps/ice-rink-web`:

```powershell
npm run export:static:ice:cms
npm run export:static:roller:cms
```

These commands:

1. snapshot CMS content
2. validate the snapshot
3. run a static Next.js build with `STATIC_CONTENT_SOURCE=cms-snapshot`
4. generate sitemap/robots/static artifact metadata
5. copy static output into `.static-artifacts/{SITE_KEY}/out/`

The existing seed-site commands remain unchanged:

```powershell
npm run export:static:ice
npm run export:static:roller
```

## CMS Snapshot Publish Dry Run

From `apps/ice-rink-web`:

```powershell
npm run publish:dry-run:cms
```

This runs the existing dry-run packaging workflow with `STATIC_CONTENT_SOURCE=cms-snapshot`.

The default dry run still uses seed-sites:

```powershell
npm run publish:dry-run
```

## Intended Publishing Workflow

1. Edit content in the admin.
2. Publish the page in Pumpkin CMS.
3. Run the CMS snapshot command for the target tenant.
4. Validate the snapshot.
5. Run static export from the CMS snapshot.
6. Validate static output.
7. Run the CMS dry-run package.
8. Inspect the manifest and summary.
9. Later, deploy the validated artifact to Azure.
10. Later, purge Cloudflare only after deployment succeeds.

## Safety Rules

- Do not snapshot API keys.
- Do not commit snapshot folders.
- Do not write `.env.local`.
- Do not write `appsettings.Development.json`.
- Do not include unpublished pages unless explicitly requested for local testing.
- Do not deploy to Azure from this bridge.
- Do not purge Cloudflare from this bridge.
- Do not create active GitHub Actions workflows from this bridge.
