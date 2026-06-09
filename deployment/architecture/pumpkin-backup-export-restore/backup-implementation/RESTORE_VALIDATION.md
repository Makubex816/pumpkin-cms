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
- stops before any real restore.

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

## Boundary

No real restore occurs. The dry-run does not import a database, call CMS/API endpoints, restore MediaAssets, copy blobs, restore static output, read protected config, export secrets, create encrypted escrow payloads, modify external systems, or publish live pages.
