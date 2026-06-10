# Backup Validator QA Result

Commands exercised:

```powershell
node src/backup-cli.mjs validate --bundle .tmp/phase-2f14-backup-generator-qa/fake-complete --mode production-restore-proof
node src/backup-cli.mjs validate --bundle .tmp/phase-2f14-backup-generator-qa/ice-complete-standard --mode production-restore-proof
```

Result:

| Bundle | Mode | Checked files | Checksum entries | Connector proof | Secret scan | Result |
| --- | --- | ---: | ---: | --- | --- | --- |
| Fake complete | `production-restore-proof` | 54 | 50 | passed | passed | passed |
| Ice live-readonly | `production-restore-proof` | 62 | 58 | passed | passed | passed |

The validator confirmed manifest membership, checksum consistency, standard-mode escrow exclusion, protected path blocking, secret-like value scanning, complete Cosmos proof, complete media proof, and tenant website bundle presence.
