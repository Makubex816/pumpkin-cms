# Pumpkin Backup Export Restore Phase 2F-5 Restore Validation Dry-Run Report

## Scope

Phase 2F-5 implemented a local-only restore validation dry-run prototype under:

`deployment/architecture/pumpkin-backup-export-restore/backup-implementation/`

This was a fake-fixture restore planning pass only. It generated local backup and restore-plan output only under ignored `.tmp`.

## What Was Implemented

- Restore validation/dry-run modules under `src/restore/`.
- CLI `restore-plan` command.
- Restore target safety checks for `.tmp` output.
- Backup validator preflight before restore planning.
- Fake CMS/media/static/config inventory readback.
- Expected inventory count fixture.
- Count comparison for tenant and platform bundles.
- JSON and Markdown restore-plan reports.
- `RESTORE_TARGET_NOT_WRITTEN.md` dry-run marker.
- Tests for valid, invalid, tampered, escrow-payload, path safety, CLI, and secret-free output behavior.

## Command Examples

```powershell
node src/backup-cli.mjs restore-plan --bundle .tmp/tenant-standard-backup --out .tmp/tenant-restore-plan --overwrite
node src/backup-cli.mjs restore-plan --bundle .tmp/platform-standard-backup --out .tmp/platform-restore-plan --overwrite
```

## Restore Validation Behavior

The restore dry-run runs the hardened backup validator first. Invalid bundles, checksum mismatches, protected paths, secret-like values, or standard backups with escrow payloads are refused before restore-plan output is created.

For valid fake bundles, the dry-run reads generated fake inventory files, confirms standard escrow is not included, confirms config inventory remains redacted, compares expected counts, and writes reports. It never writes a real database, CMS, media, static, config, or escrow target.

## Dry-Run Output Structure

```text
<restore-output>/
  restore-plan.json
  RESTORE_PLAN.md
  RESTORE_VALIDATION_RESULT.json
  RESTORE_VALIDATION_RESULT.md
  RESTORE_TARGET_NOT_WRITTEN.md
```

## Inventory Comparison

Compared counts include tenants, sites, pages, routes, forms, SEO entries, redirects, theme/settings entries, media asset entries, static evidence routes, and config inventory entries.

Expected counts are stored in:

`deployment/architecture/pumpkin-backup-export-restore/backup-implementation/fixtures/restore-expected-counts.json`

## Test Results

`npm run check` passed with syntax checks plus 30 Node tests.

Final tenant/platform backup generation, validation, and restore-plan refresh passed and remain under ignored `.tmp` output.

## Final Safety Validation

| Check | Result |
| --- | --- |
| Tenant standard backup generation | passed |
| Tenant standard backup validation | passed |
| Tenant restore-plan dry-run | passed |
| Platform standard backup generation | passed |
| Platform standard backup validation | passed |
| Platform restore-plan dry-run | passed |
| JSON parse | passed, 18 files |
| `git diff --check` | passed with CRLF warnings only |
| Trailing whitespace scan | passed, 111 files |
| Secret-shaped value scan | passed, 111 files |
| Detector contiguous risk-pattern scan | passed |
| Forbidden backup artifact scan | passed |
| `.tmp` ignore/staged check | passed |
| Staged path guard | passed, 0 staged paths and 0 guard hits |
| External call pattern scan | passed |

## Readiness Classification

| Area | Status |
| --- | --- |
| Phase 2F-4 backup validator hardening | complete |
| Phase 2F-5 restore validation dry-run prototype | yes |
| Restore-plan command | yes |
| Restore validation reports | yes |
| Inventory comparison | yes |
| Real database restore | no |
| Real CMS restore | no |
| Real secret export | no |
| Escrow payload created | no |
| Escrow restore performed | no |
| CMS writes performed | no |
| External systems changed | no |
| Live pages affected | no |

## Security Boundaries

- No production backup zip created.
- No real database import or export.
- No real CMS/API restore or export.
- No CMS/API calls.
- No real MediaAsset restore.
- No blob/media restore.
- No real static output restore.
- No protected config read.
- No real secret export.
- No encrypted escrow payload.
- No escrow restore.
- No CMS writes.
- No POST, PUT, PATCH, or DELETE requests.
- No Azure, Cloudflare, DNS, deployment, Function App setting, email, Microsoft 365, Search Console, indexing, or live-page action.

## Known Limitations

The restore validation flow is dry-run only. The Backup Center still does not implement encrypted escrow, real exporters, real importers, real restore adapters, production backup packaging, API/Admin UI integration, job workers, production audit logging, retention enforcement, or a real IceSkatingRinkRentals.com backup proof.

## Next Recommendation

Proceed to Phase 2F-6 local encrypted escrow prototype only. Do not proceed to real IceSkatingRinkRentals.com backup proof, real secret export, encrypted production escrow payloads, real export/import, restore execution, CMS/API calls, deployment, external systems, or live-page publication without separate owner approval.
