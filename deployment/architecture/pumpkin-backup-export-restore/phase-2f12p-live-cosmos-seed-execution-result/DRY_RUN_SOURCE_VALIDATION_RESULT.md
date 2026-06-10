# Dry-Run Source Validation Result

Status: passed

Source:

- `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/phase-2f12o-ice-cosmos-seed-dry-run/`

Command:

```powershell
npm run cosmos-seed:validate
```

Validated source counts:

| Container | Expected documents |
| --- | ---: |
| tenants | 1 |
| sites | 1 |
| pages | 3 |
| routes | 5 |
| forms | 3 |
| mediaAssets | 12 |
| themes | 1 |
| importRuns | 1 |
| publishRuns | 0 |
| users | 0 |
| total | 27 |

Validation passed for seed manifest, approved container mapping, `/tenantKey` partitioning, checksums, protected path scan, and secret-like value scan.
