# Export Validation Result

Status: passed

Command:

```powershell
node src/backup-cli.mjs cosmos-export:validate --export .tmp/phase-2f12r-live-cosmos-export
```

Validation checks:

| Check | Result |
| --- | --- |
| Manifest schema | passed |
| Tenant scope | passed |
| Approved containers | passed |
| Total record count | 27 |
| Checksum verification | passed |
| Secret-like value scan | passed |
| Protected path scan | passed |
| Cosmos system fields stripped | passed |

Every exported record was scoped to `tenantKey = ice-rink-rentals`.
