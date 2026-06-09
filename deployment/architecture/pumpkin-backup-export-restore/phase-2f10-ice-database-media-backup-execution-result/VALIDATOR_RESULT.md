# Validator Result

Date: 2026-06-09

Command:

```powershell
node src/backup-cli.mjs validate --bundle .tmp/ice-full-standard-backup-complete
```

Result: passed.

## Summary

| Check | Result |
| --- | --- |
| Checked files | 23 |
| Checksum result | passed |
| Checksum entries | 20 |
| Checksum files checked | 20 |
| Escrow exclusion | passed |
| Secret-leak scan | passed |
| Path safety | passed |
| Manifest file list | passed |
| Warning count | 0 |
| Failure count | 0 |

The validator confirms standard backup structure and secret/escrow exclusion for the available candidate bundle. It does not convert the missing database artifact or media blob copies into production restore proof.

