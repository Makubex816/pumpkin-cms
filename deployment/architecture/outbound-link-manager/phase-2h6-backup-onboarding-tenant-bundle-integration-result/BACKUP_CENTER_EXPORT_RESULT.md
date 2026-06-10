# Backup Center Export Result

Proof commands:

```powershell
node src/outbound-link-cli.mjs export-backup --store .tmp/phase-2h6-backup-onboarding-tenant-bundle-integration/local-store-merged --rendered .tmp/phase-2h6-backup-onboarding-tenant-bundle-integration/render-active --out .tmp/phase-2h6-backup-onboarding-tenant-bundle-integration/backup-center-export --overwrite
node src/outbound-link-cli.mjs validate-backup-export --export .tmp/phase-2h6-backup-onboarding-tenant-bundle-integration/backup-center-export
```

Result:

- validation: passed
- links: 5
- instances: 5
- render decisions: 5

Required files were written under `cms-content/`, including link registry, instances, policies, scan runs, audit summary, render decisions, JSON validation report, and Markdown validation report.
