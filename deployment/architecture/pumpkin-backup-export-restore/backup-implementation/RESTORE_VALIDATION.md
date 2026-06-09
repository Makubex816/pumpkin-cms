# Restore Validation Dry-Run

Phase 2F-5 adds a local-only restore validation dry-run. It consumes validated fake standard backup bundles and writes restore-plan reports under ignored `.tmp/` output.

## Command

```powershell
node src/backup-cli.mjs restore-plan --bundle .tmp/tenant-standard-backup --out .tmp/tenant-restore-plan --overwrite
```

Platform example:

```powershell
node src/backup-cli.mjs restore-plan --bundle .tmp/platform-standard-backup --out .tmp/platform-restore-plan --overwrite
```

## Behavior

The restore dry-run:

- runs the hardened backup validator first;
- refuses invalid or checksum-tampered bundles;
- reads fake CMS content exports;
- reads fake media inventory;
- reads fake static evidence;
- reads redacted config inventory;
- confirms standard backup escrow is not included;
- compares inventory counts against `fixtures/restore-expected-counts.json`;
- writes JSON and Markdown restore validation reports;
- writes `RESTORE_TARGET_NOT_WRITTEN.md`;
- stops before any real restore;
- in `production-restore-proof` mode, confirms fake Cosmos export, fake media copy, and tenant website bundle steps are complete before writing the plan.

## Output

Generated restore-plan output includes:

```text
<restore-output>/
  restore-plan.json
  RESTORE_PLAN.md
  RESTORE_VALIDATION_RESULT.json
  RESTORE_VALIDATION_RESULT.md
  RESTORE_TARGET_NOT_WRITTEN.md
```

## Inventory Counts

The dry-run compares tenants, sites, pages, routes, forms, SEO entries, redirects, theme/settings entries, media asset entries, static evidence routes, and config inventory entries.

For fake complete Cosmos/media bundles it also reports:

- Cosmos record-set count;
- Cosmos total record count;
- fake copied media blob count.

## Fake Complete Connector Mode

```powershell
node src/backup-cli.mjs restore-plan --bundle .tmp/ice-cosmos-media-fake-complete --out .tmp/ice-cosmos-media-fake-complete-restore-plan --mode production-restore-proof --overwrite
```

The resulting restore plan marks Cosmos portable JSON restore planning, fake media blob restore planning, and tenant website bundle layout planning as complete. It remains a dry run and writes no target system.

## Boundary

No real restore occurs. The dry-run does not import a database, call CMS/API endpoints, restore MediaAssets, copy real blobs, restore static output, read protected config, export secrets, create encrypted escrow payloads, modify external systems, or publish live pages.
