# Exact Staging Deployment Target Result

Status: unresolved executable target; candidate target record created.

## Candidate Record

| Field | Value |
| --- | --- |
| Platform | Azure Static Web Apps |
| Candidate app name | `swa-ice-rink-rentals-staging` |
| Candidate resource group | `rg-pumpkin-static-staging` |
| Candidate staging host | `ice-dev.iceskatingrinkrentals.com` |
| Alternate staging host | `staging.iceskatingrinkrentals.com` |
| Upload root | `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612180602/repo/apps/ice-rink-web/out` |
| Source docs | `deployment/static-azure/ice-staging-swa-runbook.md`, `deployment/static-azure/swa-staging-execution-prep.md` |

## Still Missing

The current safe docs still describe the Static Web App name and resource group as placeholders or suggestions. V2.8.10 did not create Azure resources or perform read/write Azure target resolution.

Missing executable target fields:

- confirmed approved subscription or redacted subscription reference for this SWA target,
- confirmation that `swa-ice-rink-rentals-staging` exists or a future explicit resource-creation boundary approval,
- Azure default hostname,
- deployment method/profile that does not expose or commit secrets,
- named future deploy operator and rollback/abort owner.

Until those are resolved, staging execution remains no-go.

