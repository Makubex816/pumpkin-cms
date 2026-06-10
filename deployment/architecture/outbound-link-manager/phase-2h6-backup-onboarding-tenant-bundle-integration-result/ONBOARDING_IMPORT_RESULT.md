# Onboarding Import Result

Valid proof:

```powershell
node src/outbound-link-cli.mjs create-onboarding-import --store .tmp/phase-2h6-backup-onboarding-tenant-bundle-integration/local-store-merged --out .tmp/phase-2h6-backup-onboarding-tenant-bundle-integration/onboarding-import-valid --overwrite
node src/outbound-link-cli.mjs validate-onboarding-import --import .tmp/phase-2h6-backup-onboarding-tenant-bundle-integration/onboarding-import-valid
```

Result:

- validation: passed
- links: 5
- instances: 5
- failures: 0

Negative proof:

- unreviewed-domain import readiness: failed as expected, 1 failure
- blocked-domain import readiness: failed as expected, 1 failure

Onboarding output files:

- `outbound-links.expected.json`
- `outbound-link-policy.json`
- `external-domain-review.md`
- `outbound-link-validation-report.md`
