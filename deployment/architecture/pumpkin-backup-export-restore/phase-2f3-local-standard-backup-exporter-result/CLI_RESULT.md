# CLI Result

## Commands

Implemented:

```powershell
node src/backup-cli.mjs help
node src/backup-cli.mjs version
node src/backup-cli.mjs create-standard --scope tenant --answers fixtures/tenant-standard-backup.answers.json --out .tmp/tenant-standard-backup --overwrite
node src/backup-cli.mjs validate --bundle .tmp/tenant-standard-backup
node src/backup-cli.mjs inspect --bundle .tmp/tenant-standard-backup
```

## Behavior

- Create command writes only under `.tmp`.
- Output outside `.tmp` is rejected by default.
- Archive-style output paths are blocked.
- Validation returns non-zero for failed bundles.
- Inspect prints redacted manifest summary only.

## Verified

- Tenant create command passed.
- Platform create command passed.
- Tenant validate command passed.
- Platform validate command passed.
- Tenant inspect command reported standard mode, tenant scope, escrow disabled, and 19 manifest content files.
