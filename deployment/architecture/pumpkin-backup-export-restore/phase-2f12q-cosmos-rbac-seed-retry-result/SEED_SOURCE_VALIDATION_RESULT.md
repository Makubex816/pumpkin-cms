# Seed Source Validation Result

Status: passed

Source:

- `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/phase-2f12o-ice-cosmos-seed-dry-run/`

Validation command:

```powershell
npm run cosmos-seed:validate
```

Validated seed package:

- total documents: 27
- checksum verification: passed
- protected path scan: passed
- secret-like value scan: passed
- approved container mapping: passed
- `/tenantKey` partition validation: passed

This validated output was the only seed source used for the live retry.
