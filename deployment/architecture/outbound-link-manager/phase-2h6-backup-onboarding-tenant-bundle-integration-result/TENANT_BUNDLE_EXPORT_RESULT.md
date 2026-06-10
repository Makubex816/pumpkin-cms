# Tenant Bundle Export Result

Proof commands:

```powershell
node src/outbound-link-cli.mjs export-tenant-bundle --store .tmp/phase-2h6-backup-onboarding-tenant-bundle-integration/local-store-merged --rendered .tmp/phase-2h6-backup-onboarding-tenant-bundle-integration/render-active --out .tmp/phase-2h6-backup-onboarding-tenant-bundle-integration/tenant-bundle-export --overwrite
node src/outbound-link-cli.mjs validate-tenant-bundle --bundle .tmp/phase-2h6-backup-onboarding-tenant-bundle-integration/tenant-bundle-export
```

Result:

- validation: passed
- links: 5
- instances: 5
- render decisions: 5

The tenant bundle export writes an `outbound-links/` folder with registry, instances, policies, scan runs, audit summary, render decisions, domain review report, and validation report.
