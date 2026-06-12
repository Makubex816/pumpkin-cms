# Staging Publish Worksheet

Status: worksheet complete; execution blocked.

| Field | Worksheet value |
| --- | --- |
| Tenant | `ice-rink-rentals` |
| Site/domain | `iceskatingrinkrentals.com` |
| Staging domain candidate | `ice-dev.iceskatingrinkrentals.com` |
| Static source | `apps/ice-rink-web` with `STATIC_CONTENT_SOURCE=seed-sites` |
| Canonical routes | `/`, `/service-areas`, `/contact` |
| Static artifact evidence | V2.8.3, 42 files, 0 errors, 0 warnings |
| Candidate hosting profile | Azure Static Web Apps staging, not executed |
| Candidate SWA placeholder | `swa-ice-rink-rentals-staging` |
| Candidate resource group placeholder | `rg-pumpkin-static-staging` |
| Deployment approval | missing, required |
| DNS approval | missing, required |
| Indexing approval | missing, required only after live publication approval |
| Live-publication approval | missing, required |

Required before execution:

1. Confirm exact staging host and default hostname.
2. Confirm sanitized no-dotenv build proof.
3. Confirm static artifact path from a fresh approved build or dry-run package.
4. Confirm owner contact-form verification.
5. Confirm final media/content approval.
6. Confirm Backup Center restore/no-go proof is acceptable for the target package.
7. Confirm deployment token/secret storage location without exposing values.
8. Confirm rollback artifact and abort owner.
9. Confirm staging validation operator and evidence path.

This worksheet is not a deployment instruction by itself.

