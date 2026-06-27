# Resource State Matrix

| Resource or binding | Current state | Evidence | Required next action |
| --- | --- | --- | --- |
| Pumpkin API source | Source-ready | `apps/pumpkin-api/Program.cs` exposes contact write and Admin read routes | Build/deploy only in a later approved deployment lane |
| Pumpkin API live host | Missing/not visible | Current `az webapp list` returned `[]` | Verify alternate host type or prepare an API host exposure plan in next phase |
| Candidate Pumpkin API URL | Candidate/stale | Repo publish-profile hint only | Do not use until live metadata and safe runtime checks verify it |
| Production Cosmos provider | Deployed | `cosmos-pumpkin-prod-eastus`, database `pumpkin-prod-cms`, container `forms` exist | Bind API runtime to this provider under protected approval |
| Staging PumpkinCMS Cosmos | Deployed but separate | `cosmos-pumpkincms-stg-olm01`, database `pumpkincms-olm-staging` | Do not confuse with production Ice persistence target |
| Admin source | Source-ready | `NEXT_PUBLIC_API_URL` client mapping and form-entry methods exist | Bind live Admin to verified API base URL |
| Admin live form-entry read | Unverified | No live Admin/API calls approved in this phase | Verify after API host and Admin base URL are approved |
| Production Ice SWA | Live | `swa-ice-static-staging`, custom domains Ready | Do not mutate until isolated lane passes |
| Isolated Ice SWA | Available | `swa-ice-static-isolated-staging`, no custom domains | Use for first runtime binding and QA |
| Static contact managed API source | Source-ready | V2.8.31 compat implementation and tests | Bind to verified API only after live API exists |
| Legacy/static contact Function App | Live but not target backend | `func-ice-static-contact-20260605`, Running | Keep as rollback/reference lane; do not treat as Pumpkin API |
| Tenant API key binding | Protected/unknown | Values intentionally not read | Bind through approved protected setting flow |
| Tenant CORS/allowed origins | Unknown | `TenantCors` is source-enforced; live tenant data not read | Verify/bind allowed origins for SWA domains before browser QA |
| Backup Center proof | Prior proof exists, runtime switch needs refresh | 2F-12N/2F-12R carryforward | Re-run required read/export proof before production switch |
