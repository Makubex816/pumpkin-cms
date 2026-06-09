# Validator Contract Update Plan

## Validation Modes

### `baseline`

Validates the existing local-only standard backup contract.

### `source-wired`

Allows database/media components to be partial when Phase 2F-10A-style source evidence exists.

### `db-media-complete`

Requires Cosmos platform evidence, Cosmos portable JSON export, media metadata, blob map, and either blob copy or accepted provider-native media backup evidence.

### `production-restore-proof`

Requires all standard backup components, checksums, manifest entries, secret-leak checks, restore-plan dry run, tenant website bundle inventory, and explicit handling for owner-decision exclusions.

## New Validator Checks

- `database.provider` must be known.
- Cosmos platform evidence must match the selected profile.
- Cosmos export manifest must list every exported logical collection.
- Exported JSON wrappers must include contract version, provider, logical collection, tenant scope, record count, and records array.
- Record counts must match the actual records arrays.
- Tenant scope must be present for export modes.
- Media provider must be known.
- Blob map must link CMS/media records to blob names or documented exclusions.
- Blob inventory must match blob map entries when inventory mode is complete.
- Blob copies must match inventory and checksum records when full-copy mode is complete.
- No standard backup artifact may contain secret-like values.
- No protected config filename may appear as an included source file.

## Failure Reports

Validator failures should produce:

- JSON report for automation.
- Markdown report for operator review.
- Component-level failure reason.
- Suggested next approval or blocker class.

## Backward Compatibility

Existing fake standard backup tests should keep passing under `baseline`. New Cosmos/media checks should activate only when the manifest declares the new components or a stricter validation mode is selected.
