# Cosmos Connector Fake Mode

Phase 2F-11 implements a fixture-only Cosmos connector foundation.

## What It Writes

Fake mode writes:

- `database/cosmos-json/export-manifest.json`
- `database/cosmos-json/containers/*.json`
- `database/cosmos-json/checksums.sha256`
- `database/platform-evidence/cosmos/cosmos-platform-backup-evidence.json`
- `database/platform-evidence/cosmos/COSMOS_PLATFORM_BACKUP_EVIDENCE.md`

The export is tenant-scoped to the fake Ice tenant fixture and uses portable JSON collection envelopes.

## What It Does Not Do

- No live Cosmos account is queried.
- No real Cosmos documents are exported.
- No database import is attempted.
- No protected config file is read.
- No storage key, connection string, or SAS value is used.
- No Azure resource is mutated.

## Fixture Inputs

- `fixtures/fake-cosmos-account.json`
- `fixtures/fake-cosmos-database.json`
- `fixtures/fake-cosmos-containers.json`
- `fixtures/fake-cosmos-documents.ice.json`
- `fixtures/fake-cosmos-platform-backup-evidence.json`

## CLI

```powershell
node src/backup-cli.mjs create-standard --scope tenant --answers fixtures/ice-cosmos-media-standard-backup.answers.json --with-fake-cosmos --out .tmp/ice-cosmos-media-fake-complete --overwrite
```

Production Cosmos discovery/export remains a future approval gate.
