# Implementation Batches

These batches describe a future connector implementation sequence. Phase 2F-10B does not implement them.

## Batch 1: Contracts And Profiles

- Add profile resolver.
- Add provider-neutral database and media contracts.
- Add presence-only env readiness checks.
- Add report writers with redaction helpers.
- Add tests for profile rejection, missing env, and protected path handling.

Exit criteria:

- Fixture profile works.
- Unknown profiles fail.
- No values are printed by readiness checks.

## Batch 2: Cosmos Fixture And Read-Only Discovery

- Add fake Cosmos fixture metadata.
- Add Cosmos discovery connector.
- Add Azure read-only discovery stubs guarded by explicit profile and approval.
- Add discovery report schema.
- Add tests for account/database/container metadata validation.

Exit criteria:

- Fixture discovery passes.
- Azure discovery cannot run without explicit approval profile.

## Batch 3: Cosmos Platform Backup Evidence

- Add platform evidence contract.
- Add evidence writer for fixture mode.
- Add read-only Azure evidence collection hooks for future approval.
- Add validation for backup policy metadata shape.

Exit criteria:

- Evidence can be represented and checksummed in fixture mode.
- Missing backup evidence is reported as partial or blocked, not complete.

## Batch 4: Portable Cosmos JSON Export

- Add tenant-scoped query planner.
- Add fake export connector.
- Add JSON wrapper writer.
- Add collection classification.
- Add redaction/secret-leak validation integration.
- Add tests for tenant-scope enforcement and record counts.

Exit criteria:

- Fixture export produces portable JSON artifacts.
- Export aborts when tenant scope is missing.

## Batch 5: Media Discovery And Blob Map

- Add media source profile.
- Add MediaAsset-to-blob map builder.
- Add fake blob inventory connector.
- Add path normalization and traversal protections.
- Add tests for URL-to-blob mapping.

Exit criteria:

- Fixture media metadata maps to expected blob names.
- Unsafe paths fail validation.

## Batch 6: Media Copy Planning

- Add copy planner.
- Add fixture copy runner into ignored `.tmp`.
- Add future Azure Blob copy/download hook behind explicit approval.
- Add checksum writer for copied media.
- Add tests for missing blobs, tamper detection, and partial copy states.

Exit criteria:

- Fixture copy can be validated.
- Live blob copy cannot run without an explicit future approval profile.

## Batch 7: Tenant Website Bundle Writer

- Add bundle writer using the Phase 2F-10A directory model.
- Integrate Cosmos and media outputs.
- Add bundle manifest.
- Add bundle-level checksums.
- Add operator handoff files.

Exit criteria:

- Fixture bundle validates end to end.

## Batch 8: Validator And Restore Plan Modes

- Add stricter validation modes.
- Add database/media completeness checks.
- Add restore-plan dry-run updates.
- Add JSON and Markdown reports.
- Add failure fixtures.

Exit criteria:

- `production-restore-proof` fails incomplete bundles.
- Complete fixture bundle passes.

## Batch 9: Docs And Result Package

- Update Backup Center docs.
- Add operator checklists.
- Add implementation result report.
- Record remaining blockers.

Exit criteria:

- Future implementation package is ready for owner review without staging backup artifacts.
