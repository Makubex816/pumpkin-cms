# Usage

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

## Inspect

```powershell
node src/backup-cli.mjs inspect --bundle .tmp/tenant-standard-backup
```

## Output Rule

The CLI refuses to write outside package `.tmp/`. It writes folder bundles only and blocks archive-style output paths.
