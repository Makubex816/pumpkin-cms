# Backup Center Integration

`export-backup` writes local Backup Center-compatible outbound link files.

Command:

```powershell
node src/outbound-link-cli.mjs export-backup --store .tmp/local-store-merged --rendered .tmp/render-active --out .tmp/backup-center-export --overwrite
node src/outbound-link-cli.mjs validate-backup-export --export .tmp/backup-center-export
```

Required files:

- `cms-content/outbound-links.json`
- `cms-content/outbound-link-instances.json`
- `cms-content/outbound-link-policies.json`
- `cms-content/outbound-link-scan-runs.json`
- `cms-content/outbound-link-audit-summary.json`
- `cms-content/outbound-link-render-decisions.json`
- `cms-content/outbound-link-validation-report.json`
- `cms-content/OUTBOUND_LINK_VALIDATION_REPORT.md`

This is local compatibility output only. It does not create a backup archive, write CMS data, call live services, or restore anything.
