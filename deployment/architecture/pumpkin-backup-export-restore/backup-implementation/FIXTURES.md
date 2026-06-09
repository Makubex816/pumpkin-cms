# Fixtures

All fixtures are fake and local. They are safe to use for Phase 2F-4 validator hardening and do not contain real CMS data, database exports, media blobs, protected config values, API keys, JWTs, auth headers, cookies, tokens, connection strings, storage keys, or escrow payloads.

## Positive Fixtures

- `fixtures/tenant-standard-backup.answers.json`
- `fixtures/platform-standard-backup.answers.json`
- `fixtures/fake-cms-content.json`
- `fixtures/fake-media-inventory.json`
- `fixtures/fake-static-evidence.json`
- `fixtures/fake-config-inventory.redacted.json`

## Failure Case Manifest

`fixtures/failure-cases.json` lists the generated negative bundle cases used by the test suite and their expected stable failure codes.

The negative bundles themselves are generated during tests under ignored `.tmp/test-*` folders and are cleaned up after the test run.

## Covered Failure Cases

- missing manifest
- invalid manifest JSON
- missing required file
- missing restore instructions
- checksum mismatch
- extra file not listed in manifest
- manifest-listed file missing from disk
- escrow payload present in standard backup
- secret-like value present in standard backup
- path traversal manifest entry
- bad platform/tenant scope mismatch
- missing redacted config inventory
- malformed checksum file
- checksum file includes itself
- config inventory values included

## Real-World Data

The future IceSkatingRinkRentals.com real backup proof target requires a separate owner-approved preflight. It is not approved by these fixtures or by Phase 2F-4.
