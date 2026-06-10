# Backup Validator Result

Status: passed

Command:

```powershell
node src/backup-cli.mjs validate --bundle .tmp/phase-2f12s-complete-ice-standard-backup --mode production-restore-proof
```

Validator summary:

| Field | Result |
| --- | --- |
| Mode | `production-restore-proof` |
| Checksum result | passed |
| Manifest file list | passed |
| Connector proof | passed |
| Escrow exclusion | passed |
| Secret-leak scan | passed |
| Protected path scan | passed |
| Failures | 0 |

The validator checked 55 files, 52 checksum entries, and 52 checksum files.
