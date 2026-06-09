# Validator

Phase 2F-4 hardens the local-only standard backup validator. It still validates fake fixture bundles only and reads/writes only inside this package's ignored `.tmp/` output.

## Contract Checks

The validator enforces:

- bundle path resolves under package `.tmp/`;
- bundle is folder format, not a zip or archive-style path;
- required folders and files exist;
- `manifest.json` parses as JSON;
- manifest contract version fields are `0.2.0`;
- `backupMode` is `standard`;
- `bundleFormat` is `folder`;
- `includesEscrow` is `false`;
- checksum algorithm is `sha256`;
- tenant and platform scope fields are internally consistent;
- manifest file entries are safe bundle-relative paths;
- manifest file list matches generated content files;
- generated JSON envelopes include schema versions;
- `checksums.sha256` parses and does not include itself;
- checksums match current file contents;
- `escrow/ESCROW_NOT_INCLUDED.md` exists;
- no encrypted escrow payload is present;
- config inventory contains presence/redacted markers only;
- no protected or secret-risk paths are present;
- no obvious secret-like values are present.

## Validation Modes

### `baseline`

`baseline` is the default. It accepts the existing partial local standard backup contract where database export is represented by a plan and media is metadata-only.

### `production-restore-proof`

`production-restore-proof` requires the fake complete connector foundation artifacts:

- manifest database component status is `cosmos` / `portable-json` / `complete`;
- Cosmos export manifest exists under `database/cosmos-json/export-manifest.json`;
- Cosmos collection envelopes exist and record counts match;
- manifest media component status is `azure-blob` / `full-copy` / `complete`;
- media blob map exists under `media/blob-map/blob-map.json`;
- every media asset has a copied fake blob file;
- tenant website bundle index exists.

This mode still uses fake fixtures only. It proves the local contract, not live production backup completeness.

## Reports

Validation writes both reports by default:

- `validation-result.json`
- `VALIDATION_RESULT.md`

Reports include status, generated timestamp, checks, warnings, failures, checked file count, checksum result, escrow exclusion result, secret-leak scan result, path safety result, and manifest file-list result.

Reports must not include raw secrets. Failure messages identify paths and stable error codes only.

## Restore Dry-Run Use

The Phase 2F-5 `restore-plan` command runs this validator before reading any fake restore inventory. Invalid bundles, checksum mismatches, secret-like values, protected paths, or escrow payloads stop the restore dry-run before output is created.

## Stable Failure Codes

The Phase 2F-4 test suite covers these negative cases:

- `MANIFEST_MISSING`
- `MANIFEST_PARSE_ERROR`
- `REQUIRED_FILE_MISSING`
- `RESTORE_INSTRUCTIONS_MISSING`
- `CHECKSUM_MISMATCH`
- `FILE_NOT_IN_MANIFEST`
- `MANIFEST_FILE_MISSING_ON_DISK`
- `ESCROW_PAYLOAD_PRESENT`
- `SECRET_LIKE_VALUE`
- `MANIFEST_FILE_PATH_INVALID`
- `SCOPE_TENANT_MISMATCH`
- `CONFIG_INVENTORY_MISSING`
- `CHECKSUM_PARSE_ERROR`
- `CHECKSUM_INCLUDES_SELF`
- `CONFIG_VALUES_INCLUDED`
- `COSMOS_EXPORT_MISSING`
- `COSMOS_EXPORT_INVALID`
- `COSMOS_EXPORT_COUNT_MISMATCH`
- `MEDIA_BLOB_COPY_MISSING`
- `MEDIA_BLOB_COPY_INVALID`
- `TENANT_WEBSITE_BUNDLE_MISSING`

## Boundary

The validator does not call CMS/API endpoints, export a real database, read protected config, create encrypted escrow payloads, execute restore logic, create zips, deploy, touch external systems, call Cosmos, or download blobs.
