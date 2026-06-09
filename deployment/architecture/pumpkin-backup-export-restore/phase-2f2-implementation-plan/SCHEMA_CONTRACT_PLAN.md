# Schema Contract Plan

## Source Schemas

Phase 2F-1 schemas are the initial source:

- `schemas/backup-manifest.schema.json`
- `schemas/backup-job.schema.json`
- `schemas/backup-artifact.schema.json`
- `schemas/escrow-manifest.schema.json`
- `schemas/escrow-request.schema.json`
- `schemas/escrow-recipient.schema.json`
- `schemas/restore-validation.schema.json`

## Future Schema Ownership

For Phase 2F-3, copy or reference these schemas from:

`deployment/architecture/pumpkin-backup-export-restore/backup-implementation/schemas/`

Schemas should stay versioned and test-backed. Do not silently change schema behavior without fixture updates.

## Contract Rules

- `schemaVersion` is required in every top-level file.
- `additionalProperties` should default to `false` for strict records.
- Backward-compatible additions require version notes and fixtures.
- Breaking changes require a new schema version and migration notes.
- The validator must report schema path and plain-English operator guidance.

## Artifact Mapping

| Artifact | Schema |
| --- | --- |
| `manifest.json` | `backup-manifest.schema.json` |
| `job.json` | `backup-job.schema.json` |
| `artifacts/*.json` | `backup-artifact.schema.json` |
| `escrow/escrow-manifest.json` | `escrow-manifest.schema.json` |
| `escrow/escrow-request.json` | `escrow-request.schema.json` |
| `escrow/recipient-public-keys.json` | `escrow-recipient.schema.json` entries |
| `RESTORE_VALIDATION.json` | `restore-validation.schema.json` |

## Fixture Requirement

Every schema must have:

- valid minimal fixture;
- valid full fixture;
- invalid missing required field fixture;
- invalid additional property fixture;
- invalid status enum fixture.
