# Restore Plan Result

Status: passed

Command:

```powershell
node src/backup-cli.mjs restore-plan --bundle .tmp/phase-2f12r-ice-standard-backup-with-cosmos-export --out .tmp/phase-2f12r-restore-plan --expected-counts .tmp/phase-2f12r-ice-standard-backup-with-cosmos-export-expected-counts.json --mode database-backup-proof --overwrite
```

Restore-plan output:

- Mode: `database-backup-proof`
- Dry-run only: true
- Restore executed: false
- Cosmos portable JSON restore step: complete for planning
- Media blob restore step: blocked
- Tenant website bundle step: blocked
- Failures: 0

Inventory counts:

| Item | Count |
| --- | ---: |
| tenants | 1 |
| sites | 1 |
| pages | 3 |
| routes | 5 |
| forms | 3 |
| seoEntries | 3 |
| redirects | 0 |
| themeSettings | 1 |
| mediaAssets | 12 |
| cosmosRecordSets | 10 |
| cosmosRecords | 27 |
| mediaCopiedBlobs | 0 |
| staticEvidenceRoutes | 5 |
| configVariables | 6 |

Restore plan SHA256:

`4FB692F8E90E49F872F9A8FBBDA691764A83F946A6CA46AF75E79695B8C0D2DB`
