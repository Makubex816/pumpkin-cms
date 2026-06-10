# Restore Validation Simulation Result

Proof command:

```powershell
node src/outbound-link-cli.mjs simulate-restore-validation --export .tmp/phase-2h6-backup-onboarding-tenant-bundle-integration/backup-center-export --out .tmp/phase-2h6-backup-onboarding-tenant-bundle-integration/restore-validation --overwrite
```

Result:

- status: passed
- links: 5
- instances: 5
- render decisions: 5

Simulation checks:

- backup export validation passed;
- link count preserved;
- instance count preserved;
- policy state preserved;
- render decisions preserved;
- disabled status preservation is covered by automated test.

No live restore occurred.
