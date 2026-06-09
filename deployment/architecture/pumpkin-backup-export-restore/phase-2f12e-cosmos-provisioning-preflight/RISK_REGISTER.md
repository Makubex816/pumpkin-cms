# Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Provisioning wrong subscription | Data/source confusion | Owner-confirmed worksheet and preflight signoff |
| Cosmos backup policy under-scoped | Weak recovery posture | Decide continuous vs periodic before provisioning |
| Poor partition key | Cross-tenant query/export risk | Use tenant-aware partitioning and export filters |
| RBAC too broad | Security exposure | Separate provisioning, runtime, and backup identities |
| Endpoint leaks config | Secret exposure | Non-secret contract, forbidden-field tests, response allowlist |
| Seed/migration source unclear | Incomplete backup proof | Require seed/migration preflight before writes |
| Cosmos target mistaken as configured source | False readiness | Keep `future-target` distinct from `configured` |
| Local-dev profile treated as production | False proof | Validator and profile checks block production proof |

## Residual Risk

Ice remains not fully backupable until provisioning, CMS wiring, seed/migration, read-only verification, export, checksums, and restore-plan validation all pass in later approved phases.
