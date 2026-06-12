# Deployment Target Worksheet

Status: deployment target not approved; no deployment performed.

| Field | Candidate value | Approval state |
| --- | --- | --- |
| Hosting option | Azure Static Web Apps staging | candidate only |
| Staging domain | `ice-dev.iceskatingrinkrentals.com` | candidate only |
| SWA name | `swa-ice-rink-rentals-staging` | placeholder from safe docs |
| Resource group | `rg-pumpkin-static-staging` | placeholder from safe docs |
| Azure default hostname | TBD | missing |
| Deployment token location | GitHub/Azure secret storage only | missing |
| Artifact path | TBD after sanitized build | missing |
| Operator | TBD | missing |
| Rollback artifact | TBD | missing |

No Azure command was run in V2.8.4. Any future target resolution must avoid keys/listKeys, connection strings, SAS, or secret export.

