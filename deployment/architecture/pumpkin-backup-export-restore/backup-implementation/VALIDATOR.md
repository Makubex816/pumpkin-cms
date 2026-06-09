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

## Reports

Validation writes both reports by default:

- `validation-result.json`
- `VALIDATION_RESULT.md`

Reports include status, generated timestamp, checks, warnings, failures, checked file count, checksum result, escrow exclusion result, secret-leak scan result, path safety result, and manifest file-list result.

Reports must not include raw secrets. Failure messages identify paths and stable error codes only.

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

## Boundary

The validator does not call CMS/API endpoints, export a real database, read protected config, create encrypted escrow payloads, execute restore logic, create zips, deploy, or touch external systems.
