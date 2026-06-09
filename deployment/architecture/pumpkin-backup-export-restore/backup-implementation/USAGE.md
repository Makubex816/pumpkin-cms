# Usage

Run commands from:

```powershell
deployment/architecture/pumpkin-backup-export-restore/backup-implementation
```

## Help

```powershell
node src/backup-cli.mjs help
node src/backup-cli.mjs version
```

## Create Tenant Standard Backup

```powershell
node src/backup-cli.mjs create-standard --scope tenant --answers fixtures/tenant-standard-backup.answers.json --out .tmp/tenant-standard-backup --overwrite
```

## Create Platform Standard Backup

```powershell
node src/backup-cli.mjs create-standard --scope platform --answers fixtures/platform-standard-backup.answers.json --out .tmp/platform-standard-backup --overwrite
```

## Validate

```powershell
node src/backup-cli.mjs validate --bundle .tmp/tenant-standard-backup
```

`validate` writes `validation-result.json` and `VALIDATION_RESULT.md` by default. It exits with a non-zero status when validation fails.

Proof-mode validation for the fake complete Cosmos/media bundle:

```powershell
node src/backup-cli.mjs validate --bundle .tmp/ice-cosmos-media-fake-complete --mode production-restore-proof
```

## Restore Validation Dry-Run

```powershell
node src/backup-cli.mjs restore-plan --bundle .tmp/tenant-standard-backup --out .tmp/tenant-restore-plan --overwrite
```

`restore-plan` validates the backup bundle first, compares fake inventory counts, writes restore-plan JSON/Markdown reports, and exits non-zero if validation fails. It does not restore anything.

## Fake Ice Cosmos/Media Connector Bundle

```powershell
node src/backup-cli.mjs create-standard --scope tenant --answers fixtures/ice-cosmos-media-standard-backup.answers.json --with-fake-cosmos --with-fake-media-copy --tenant-website-bundle --out .tmp/ice-cosmos-media-fake-complete --overwrite
node src/backup-cli.mjs validate --bundle .tmp/ice-cosmos-media-fake-complete --mode production-restore-proof
node src/backup-cli.mjs restore-plan --bundle .tmp/ice-cosmos-media-fake-complete --out .tmp/ice-cosmos-media-fake-complete-restore-plan --mode production-restore-proof --overwrite
```

Equivalent package scripts:

```powershell
npm run create:ice-fake-complete
npm run validate:ice-fake-complete
npm run restore:ice-fake-complete
```

This mode writes fake Cosmos JSON and fake text blob copy artifacts only. It does not call Cosmos, Azure Blob Storage, CMS APIs, or protected config.

## Fake Encrypted Escrow

```powershell
node src/backup-cli.mjs escrow-create-fake --request fixtures/fake-escrow-request.json --out .tmp/fake-escrow --overwrite
node src/backup-cli.mjs escrow-validate --escrow .tmp/fake-escrow
node src/backup-cli.mjs escrow-inspect --escrow .tmp/fake-escrow
```

`escrow-create-fake` uses fake fixtures only, generates runtime test keys, writes encrypted fake escrow output under `.tmp`, and does not print fake payload values.

## Inspect

```powershell
node src/backup-cli.mjs inspect --bundle .tmp/tenant-standard-backup
```

`inspect` prints only non-secret manifest summary fields.

## Output Rule

The CLI refuses to write outside package `.tmp/`. It writes folder bundles, restore-plan dry-run output, fake connector output, and fake encrypted escrow test output only, and blocks archive-style paths such as `.zip`, `.backup`, `.bak`, and `.bacpac`.

## Phase Boundary

This CLI does not read protected config, inspect real secret values, create production backup zips, perform a real Cosmos export, call live Azure Blob Storage, call CMS/API endpoints from the fake connector flow, export/import a real database, export/restore real media, create production escrow payloads, restore data into real systems, deploy, or publish live pages.
