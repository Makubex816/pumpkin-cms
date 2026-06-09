# CLI Result

Updated CLI:

```powershell
node src/backup-cli.mjs create-standard --scope tenant --answers fixtures/ice-cosmos-media-standard-backup.answers.json --with-fake-cosmos --with-fake-media-copy --tenant-website-bundle --out .tmp/ice-cosmos-media-fake-complete --overwrite
node src/backup-cli.mjs validate --bundle .tmp/ice-cosmos-media-fake-complete --mode production-restore-proof
node src/backup-cli.mjs restore-plan --bundle .tmp/ice-cosmos-media-fake-complete --out .tmp/ice-cosmos-media-fake-complete-restore-plan --mode production-restore-proof --overwrite
```

Added package scripts:

- `create:ice-fake-complete`
- `validate:ice-fake-complete`
- `restore:ice-fake-complete`

All output remains under ignored `.tmp`.
