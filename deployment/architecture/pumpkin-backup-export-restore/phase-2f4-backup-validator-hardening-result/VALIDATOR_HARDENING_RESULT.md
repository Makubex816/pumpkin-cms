# Validator Hardening Result

## Hardened

- Required folder checks.
- Required file checks with specific restore/config/manifest codes.
- Manifest JSON parse and schema contract checks.
- Manifest `0.2.0` version enforcement.
- Standard mode enforcement.
- Folder bundle enforcement.
- Escrow exclusion enforcement.
- Tenant/platform scope consistency checks.
- Safe bundle-relative path checks.
- Generated JSON schema-version checks.
- Config inventory redaction checks.
- Protected-path checks.
- Secret-like value checks.
- JSON and Markdown validation reports with summary metrics.

## Stable Failure Codes

The test suite covers stable failure codes for missing manifest, invalid manifest JSON, missing required files, checksum mismatch, file-list drift, escrow payloads, secret-like values, path traversal, scope mismatch, missing redacted config inventory, malformed checksum files, checksum self-inclusion, and config value inclusion.
