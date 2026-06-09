# Test Fixture Plan

## Fixture Areas

- Cosmos account/database/container metadata.
- Cosmos platform backup evidence.
- Cosmos portable JSON exports.
- Tenant/site/page/route records.
- MediaAsset records.
- Blob inventory records.
- Blob copy outputs.
- Bundle manifests and checksums.
- Restore-plan dry-run reports.

## Fixture Principles

- Fixtures must use fake data only.
- Fixtures must not contain real secrets, customer PII, account keys, auth tokens, or protected config contents.
- Fixture names should be obviously non-production.
- Fixture paths must stay under the backup implementation fixture or ignored `.tmp` tree.

## Required Tests

- Missing required env presence fails readiness.
- Env values are never printed in readiness output.
- Unknown profile fails.
- Cosmos provider mismatch fails.
- Missing tenant scope aborts export.
- Cosmos JSON wrapper schema is enforced.
- Record count mismatches fail.
- Tenant-scoped export excludes out-of-scope records.
- PII-classified collections require owner decision.
- Blob URL mapping handles public host URLs.
- Blob path traversal attempts fail.
- Missing blob inventory entries fail complete media mode.
- Copied blob checksum tampering fails.
- Bundle manifest references only existing files.
- Checksum file references only existing files.
- Restore-plan dry run reports partial and blocked components.
- Standard backup secret-leak detector fails unsafe fixture artifacts.

## Failure Fixtures

Add intentionally invalid fixtures for:

- Missing partition key.
- Missing tenant ID.
- Cross-tenant record.
- Record count mismatch.
- Missing media blob.
- Tampered media checksum.
- Protected config filename included as source.
- Secret-like value in a standard backup artifact.

Failure fixtures should be isolated and clearly named so they are never mistaken for valid backup output.
