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

## Inspect

```powershell
node src/backup-cli.mjs inspect --bundle .tmp/tenant-standard-backup
```

`inspect` prints only non-secret manifest summary fields.

## Output Rule

The CLI refuses to write outside package `.tmp/`. It writes folder bundles only and blocks archive-style paths such as `.zip`, `.backup`, `.bak`, and `.bacpac`.

## Phase Boundary

This CLI does not read protected config, inspect secret values, create production backup zips, call CMS/API endpoints, export a real database, export real media, create encrypted escrow payloads, restore data, deploy, or publish live pages.
