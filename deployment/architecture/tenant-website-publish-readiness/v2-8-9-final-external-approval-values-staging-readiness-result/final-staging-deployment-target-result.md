# Final Staging Deployment Target Result

Status: unresolved, candidate platform only.

## Safe Candidate Evidence

| Field | Candidate |
| --- | --- |
| Platform family | Azure Static Web Apps |
| Candidate staging domain | `ice-dev.iceskatingrinkrentals.com` |
| Alternate staging domain | `staging.iceskatingrinkrentals.com` |
| Candidate Static Web App | `swa-ice-rink-rentals-staging` |
| Candidate resource group | `rg-pumpkin-static-staging` |
| Source | `deployment/static-azure/ice-staging-swa-runbook.md` |

The runbook records Azure Static Web Apps as the first deployment target family and Ice as the first staging target direction. It still uses candidate/placeholder resource values and requires explicit target completion before any staging publish boundary.

## Required Unblock

Provide exact non-secret staging target approval:

- target Static Web App/resource identity,
- resource group,
- default hostname or approved staging host,
- upload/deployment mechanism,
- auth/profile mode,
- operator identity/checklist owner,
- rollback/abort criteria,
- confirmation that deployment is approved for the future execution phase.

