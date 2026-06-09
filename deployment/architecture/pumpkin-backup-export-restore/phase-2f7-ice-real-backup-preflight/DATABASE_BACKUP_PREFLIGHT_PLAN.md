# Database Backup Preflight Plan

## Future Database Scope

The Ice standard backup should include one approved database recovery artifact reference:

- Azure SQL platform backup evidence, or
- encrypted BACPAC/export artifact, if separately approved, or
- documented provider-managed backup evidence plus restore instructions, if portable export is deferred.

## Preferred Execution Order

1. Confirm owner approval for database backup execution.
2. Confirm the approved database export mode.
3. Confirm output storage location and encryption requirement.
4. Confirm no incompatible schema migration is running.
5. Capture export start timestamp and database logical identifier without connection strings.
6. Produce the approved artifact or evidence.
7. Compute checksum and add artifact metadata to the standard backup manifest.
8. Validate artifact presence and integrity.
9. Plan restore into local/sandbox only.

## Future Export Options

| Option | Use When | Requirements |
| --- | --- | --- |
| Azure SQL platform backup evidence | Portable export is not approved yet | Evidence capture only, no secret values |
| BACPAC export | Portable tenant recovery proof is approved | Encryption, checksum, sensitive artifact handling |
| Offline restore test copy | Restore drill is separately approved | Sandbox target only, never production |

## Consistency Rules

- Record export start and end timestamps.
- Prefer transactionally consistent export.
- Block export during incompatible migrations.
- Mark backup stale if writes continue without snapshot isolation.
- Preserve database schema version evidence.

## Sensitive Artifact Handling

Database artifacts are sensitive even when no explicit secrets are included. Portable artifacts must be encrypted at rest, checksummed, access-limited, retention-limited, and excluded from git.

## Phase 2F-7 Boundary

No database export, BACPAC creation, database import, Azure backup command, connection string read, or restore action occurs in this phase.
