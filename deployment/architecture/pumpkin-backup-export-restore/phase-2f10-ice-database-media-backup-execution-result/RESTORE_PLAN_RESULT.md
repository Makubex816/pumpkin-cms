# Restore Plan Result

Date: 2026-06-09

Command:

```powershell
node src/backup-cli.mjs restore-plan --bundle .tmp/ice-full-standard-backup-complete --out .tmp/ice-full-standard-restore-plan-complete --expected-counts .tmp/ice-full-standard-backup-expected-counts.json --overwrite
```

Result: passed as a dry-run for available inventory.

Restore dry-run path:

`deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/ice-full-standard-restore-plan-complete/`

## Count Comparison

| Inventory | Expected | Actual | Status |
| --- | ---: | ---: | --- |
| Tenants | 1 | 1 | passed |
| Sites | 1 | 1 | passed |
| Pages | 3 | 3 | passed |
| Routes | 5 | 5 | passed |
| Forms | 3 | 3 | passed |
| SEO entries | 3 | 3 | passed |
| Redirects | 0 | 0 | passed |
| Theme settings | 1 | 1 | passed |
| Media assets | 12 | 12 | passed |
| Static evidence routes | 5 | 5 | passed |
| Config variables | 11 | 11 | passed |

## Boundary

No database import, CMS API restore, MediaAsset restore, blob restore, static output restore, protected config read, secret export, escrow restore, external mutation, or live-page publication occurred.

## Production Proof

Production restore proof is not achieved because the database artifact and media blob copies are still missing.

