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

## Restore Validation Dry-Run

```powershell
node src/backup-cli.mjs restore-plan --bundle .tmp/tenant-standard-backup --out .tmp/tenant-restore-plan --overwrite
```

`restore-plan` validates the backup bundle first, compares fake inventory counts, writes restore-plan JSON/Markdown reports, and exits non-zero if validation fails. It does not restore anything.

## Inspect

```powershell
node src/backup-cli.mjs inspect --bundle .tmp/tenant-standard-backup
```

`inspect` prints only non-secret manifest summary fields.

## Output Rule

The CLI refuses to write outside package `.tmp/`. It writes folder bundles and restore-plan dry-run output only, and blocks archive-style paths such as `.zip`, `.backup`, `.bak`, and `.bacpac`.

## Phase Boundary

This CLI does not read protected config, inspect secret values, create production backup zips, call CMS/API endpoints, export/import a real database, export/restore real media, create encrypted escrow payloads, restore data into real systems, deploy, or publish live pages.
