# Failure Fixture Result

The test suite generates fake failure bundles under ignored `.tmp/test-*` output.

Restore dry-run failure coverage includes:

- invalid bundle refused;
- checksum-tampered bundle refused;
- standard backup with escrow payload refused;
- output outside `.tmp` refused;
- output nested inside source bundle refused;
- generated restore-plan reports checked for secret-like values;
- CLI restore-plan success path verified.

The existing Phase 2F-4 validator failure fixtures remain in place and continue to pass.
