# Staging Deployment Target Decision Record

State: unresolved; candidate values recorded.

## Candidate Evidence

| Field | Candidate value | Source |
| --- | --- | --- |
| Staging domain candidate | `ice-dev.iceskatingrinkrentals.com` | V2.8.4 staging worksheet and `deployment/static-azure/ice-staging-swa-runbook.md` |
| Alternate staging domain | `staging.iceskatingrinkrentals.com` | `deployment/static-azure/swa-staging-execution-prep.md` |
| Candidate platform | Azure Static Web Apps staging | V2.8.4 staging worksheet |
| Candidate SWA name | `swa-ice-rink-rentals-staging` | V2.8.4 staging worksheet and `deployment/static-azure/ice-staging-swa-runbook.md` |
| Candidate resource group | `rg-pumpkin-static-staging` | V2.8.4 staging worksheet and `deployment/static-azure/ice-staging-swa-runbook.md` |

## Decision

No exact staging deployment target is approved by V2.8.7.

The known values are placeholders/candidates. They are sufficient for a target intake record but not for staging execution.

## Missing Operator Inputs

- Exact approved hosting platform.
- Exact approved Azure subscription or redacted subscription reference.
- Exact approved resource group.
- Exact approved Static Web App or storage static website target.
- Exact default hostname, if resource already exists.
- Exact upload root and artifact source.
- Safe deployment auth mode without keys/listKeys, connection strings, or SAS.
- Named operator and approver.
- Rollback/abort owner and rollback artifact.
