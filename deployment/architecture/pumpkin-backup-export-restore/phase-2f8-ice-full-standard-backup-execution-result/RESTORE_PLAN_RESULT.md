# Restore Plan Result

Date: 2026-06-09

Command:

```powershell
npm run restore:ice
```

Result: passed as a dry-run restore plan.

Restore output path:

`deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/ice-full-standard-restore-plan/`

## Dry-Run Boundaries

| Boundary | Performed |
| --- | --- |
| Real database import | No |
| CMS API restore/write | No |
| MediaAsset restore/write | No |
| Blob restore | No |
| Static output restore | No |
| Protected config read | No |
| Secret export | No |
| Encrypted escrow payload created | No |
| External system mutation | No |
| Live-page publication | No |

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

## Important Limitation

The restore-plan dry-run verifies the shape and counts of the available bundle content. It does not prove full production recovery because the database export artifact and media blob copies are not included.

