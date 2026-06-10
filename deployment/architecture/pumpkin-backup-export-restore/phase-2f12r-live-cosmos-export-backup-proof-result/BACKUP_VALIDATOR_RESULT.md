# Backup Validator Result

Status: passed

Command:

```powershell
node src/backup-cli.mjs validate --bundle .tmp/phase-2f12r-ice-standard-backup-with-cosmos-export --mode database-backup-proof
```

Validator summary:

| Field | Result |
| --- | --- |
| Mode | `database-backup-proof` |
| Checksum result | passed |
| Manifest file list | passed |
| Cosmos connector proof | passed |
| Escrow exclusion | passed |
| Secret-leak scan | passed |
| Protected path scan | passed |
| Failures | 0 |

This mode proves the database backup component only. It intentionally does not require media full-copy proof.
