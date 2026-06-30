# V2.8.46A Legacy Static Form Endpoint Cleanup Report

Phase status: closed_deferred_no_delete.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: legacy_static_form_endpoint_dependency_proof_safe_decommission.

## Carryforward

V2.8.46 deleted only two proven-empty fallback resource groups: `rg-pumpkin-api-prod-eastus` and `rg-pumpkin-api-prod-eastus2`.

V2.8.46 deferred `rg-ice-static-form-endpoint` because it was non-empty. V2.8.46A evaluated that deferred group using the V2.8.45D static-contact managed API recovery and the current V2.8.46 registry as carryforward.

## Subscription Lock

Active subscription was set and verified before Azure operations:

| Field | Result |
| --- | --- |
| Subscription name | Azure subscription 1 |
| Subscription ID | `ff887def-fd83-4a19-9298-13d4b1687873` |
| Operator user | `Contact@iceskatingrinkrentals.com` |

## Legacy Resource Inventory

`rg-ice-static-form-endpoint` exists in East US with three expected resources:

| Resource | Type | Status |
| --- | --- | --- |
| `func-ice-static-contact-20260605` | Function App | Running, anonymous HTTP POST trigger at `static-contact` |
| `EastUSPlan` | App Service plan | Dynamic Y1 plan for Function App |
| `iceforms20260605` | Storage account | StorageV2, backing storage for legacy Function App |

The Function App has only the default Azure hostname and no custom hostnames.

## Dependency Proof

Proof that lowered dependency risk:

- No non-document repo/source references were found for the legacy resource group, Function App, default hostname, storage account, or plan.
- Live SWA/App Service appsetting scans found zero setting-name or redacted value matches for the legacy Function App/storage identifiers.
- No custom hostname was present on the legacy Function App.
- Activity Log query for the legacy resource group returned zero events in the 30-day window.

Proof that blocked deletion:

- Function App metrics over the 30-day window showed recent traffic/executions:
  - `Requests`: 209 total, non-zero on 12 daily points.
  - `FunctionExecutionCount`: 79 total, non-zero on 3 daily points.
  - `Http2xx`: 147 total.
  - `Http4xx`: 60 total.
  - `Http5xx`: 2 total.
- Storage account metrics showed recent transactions/ingress/egress in the same window.
- Storage container listing succeeded, but blob listing failed through RBAC login for the runtime containers; storage contents could not be fully classified without keys/SAS, which were not approved.

## Decision

Decision: defer decommission.

No stop was attempted. No delete was attempted.

The decommission proof gates did not pass because recent Function App executions indicate possible live traffic and the storage account contents could not be safely classified with approved read-only methods.

## Runtime Proof

Pre-decommission and final no-regression checks were GET-only and all returned HTTP 200:

- Production apex `/`, `/contact`, `/service-areas`, `/api/static-contact-health`.
- Production www `/`, `/contact`, `/service-areas`, `/api/static-contact-health`.
- Isolated `/api/static-contact-health`.
- Pumpkin API `/health` and `/api/health`.
- Admin UI production `/` and `/login`.

No contact POST occurred.

## Registry Update

Created:

- `deployment/architecture/pumpkin-platform/PUMPKIN_LIVE_RESOURCE_REGISTRY_V2_8_46A.md`

The registry records `rg-ice-static-form-endpoint` as deferred, with proof reasons and next required evidence.

## Security Boundary

No deploy occurred. No contact POST occurred. No content write occurred. No appsetting, DNS, custom-domain, or indexing mutation occurred. No resource was stopped or deleted. No live production/isolated/admin/API/Cosmos/media/monitoring resource was touched. No Key Vault secret query, storage key/listKeys, SAS generation, connection string generation, protected config read, owner hard-copy read, or `.tmp` staging occurred.

## Files

Created:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_46A_LEGACY_STATIC_FORM_ENDPOINT_CLEANUP_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-46a-legacy-static-form-endpoint-cleanup-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_LIVE_RESOURCE_REGISTRY_V2_8_46A.md`

## Commit Instructions

Use exact-path staging only:

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_46A_LEGACY_STATIC_FORM_ENDPOINT_CLEANUP_REPORT.md deployment/architecture/tenant-website-publish-readiness/v2-8-46a-legacy-static-form-endpoint-cleanup-result deployment/architecture/pumpkin-platform/PUMPKIN_LIVE_RESOURCE_REGISTRY_V2_8_46A.md
git commit -m "Document V2.8.46A legacy endpoint deferral"
```
