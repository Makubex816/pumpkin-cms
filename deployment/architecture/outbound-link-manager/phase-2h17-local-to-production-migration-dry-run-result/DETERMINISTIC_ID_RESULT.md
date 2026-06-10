# Deterministic ID Result

The migration dry-run uses deterministic SHA-256 based IDs for:

- target production candidate records
- migration record IDs
- trace request/action/correlation IDs
- rollback plan IDs
- review decision IDs
- bulk action IDs
- validation result IDs

The test suite verifies deterministic behavior by running the same dry-run twice and comparing candidate IDs and checksums.

Result: deterministic rerun test passed.

