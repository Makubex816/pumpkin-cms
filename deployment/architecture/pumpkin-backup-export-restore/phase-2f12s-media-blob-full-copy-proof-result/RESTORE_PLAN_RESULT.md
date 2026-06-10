# Restore Plan Result

Status: passed

Command:

```powershell
node src/backup-cli.mjs restore-plan --bundle .tmp/phase-2f12s-complete-ice-standard-backup --out .tmp/phase-2f12s-restore-plan --expected-counts .tmp/phase-2f12s-complete-ice-standard-backup-expected-counts.json --mode production-restore-proof --overwrite
```

Restore-plan output:

- Mode: `production-restore-proof`
- Generated: `2026-06-10T01:50:44.900Z`
- Dry-run only: true
- Restore executed: false
- Cosmos portable JSON restore planning step: complete
- Media blob restore planning step: complete
- Tenant website bundle layout step: complete
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
| mediaCopiedBlobs | 9 |
| staticEvidenceRoutes | 5 |
| configVariables | 6 |

Restore plan SHA256:

`D1A9109A122CFCBC8CF3242C25471A72DADBC942EE0716E009F41E28B103BAE2`
