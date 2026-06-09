# Failure Fixture Result

The package includes `fixtures/failure-cases.json` as the negative-case manifest.

The Node test suite generates fake broken bundles under ignored `.tmp/test-*` folders for:

- missing manifest;
- invalid manifest JSON;
- missing required file;
- missing restore instructions;
- checksum mismatch;
- extra file not listed in manifest;
- manifest-listed file missing from disk;
- escrow payload present in standard backup;
- secret-like value present in standard backup;
- path traversal manifest entry;
- bad platform/tenant scope mismatch;
- missing redacted config inventory;
- malformed checksum file;
- checksum file includes itself;
- config inventory values included.

The generated negative bundles are local test artifacts and are cleaned up after tests.
