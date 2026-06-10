# Validator Result

Status: passed

Commands run:

```powershell
npm run cosmos-seed:ice-dry-run
npm run cosmos-seed:validate
npm run check
```

Seed validator summary:

| Check | Result |
| --- | --- |
| Source backup validation | passed |
| Seed manifest schema | passed |
| Approved container mapping | passed |
| `/tenantKey` partitioning | passed |
| Checksums | passed |
| Protected path scan | passed |
| Secret-like value scan | passed |
| Warnings | 0 |
| Failures | 0 |

Full package check passed with 72 Node tests.
