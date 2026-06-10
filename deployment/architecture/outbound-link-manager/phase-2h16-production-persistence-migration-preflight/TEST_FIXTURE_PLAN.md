# Test Fixture Plan

Future implementation and dry-run phases need fixtures that preserve current local coverage.

Fixture groups:

- local store baseline
- local-to-production mapped records
- policy with allowed/blocked/pending domains
- render decisions
- approve/block/ignore review decisions
- link and instance status updates
- policy update
- scan-run creation
- bulk domain actions
- viewer blocked
- tenant mismatch blocked
- live-readonly blocked
- live-write-approved blocked
- URL redaction
- Resource Registry redacted target
- Backup Center pre-migration candidate

Tests should run without live Azure/CMS/API access and without protected config.
