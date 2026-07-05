# Airstrip Package Validator Replay

Status: passed with expected V2.8.60V warning.

Command:

```powershell
node deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/validate-tenant-package.mjs C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\airstrip-pumpkin-package-v1 --out .tmp/v2-8-60v/airstrip-validation-summary.json
```

Result:

- valid: true
- errors: 0
- warnings: 1
- tenantId: `airstrip-club-las-vegas`
- packageMode: `full-template`
- expected public routes: 26
- responsive file present: false

Warning:

`Missing validation/responsive-routes.json. This file is required for packages converted or updated after V2.8.60V.`

Classification: legacy_package_responsive_guardrail_warning_not_blocking_validator_replay.
