# Normalized Package Validator Result

Validator:

`deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/validate-tenant-package.mjs`

Command target:

`C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\airstrip-pumpkin-package-v1`

Result:

| check | result |
| --- | --- |
| Valid | Yes |
| Errors | 0 |
| Warnings | 0 |
| Package mode | `full-template` |
| Tenant ID | `airstrip-club-las-vegas` |
| Required modules missing | 0 |
| Required files missing | 0 |
| Tenant ID mismatches | 0 |
| Baseline pages present | home, contact, service-areas |
| Media assets | 13 |
| Users | 1 placeholder handoff user |
| Forms | 1 |
| Expected routes | 26 |

Initial validator run failed only because Windows PowerShell emitted BOM-bearing UTF-8. The package JSON was rewritten as BOM-free UTF-8 and the validator then passed.

