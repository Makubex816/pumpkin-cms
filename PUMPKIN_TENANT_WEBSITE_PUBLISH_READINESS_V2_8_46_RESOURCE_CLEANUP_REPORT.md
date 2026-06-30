# V2.8.46 Resource Cleanup Report

Phase status: closed_success.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: resource_cleanup_dependency_proof_safe_decommission_no_runtime_mutation.

## Carryforward

V2.8.45D recovered static-contact managed API health after media-origin validator alignment. Production apex, www, and default Static Web App `/api/static-contact-health` returned HTTP 200, public pages stayed HTTP 200, Pumpkin API health stayed HTTP 200, Admin UI production stayed HTTP 200, and monitoring/storage hardening remained preserved.

V2.8.46 used that state plus V2.8.45 monitoring/storage hardening, V2.8.44 PublishRun proof, and V2.8.36 multi-tenant platform contract to clean up obsolete empty fallback resource groups only.

## Subscription Lock

Active subscription was set and verified before Azure operations:

| Field | Result |
| --- | --- |
| Subscription name | Azure subscription 1 |
| Subscription ID | `ff887def-fd83-4a19-9298-13d4b1687873` |
| Operator user | `Contact@iceskatingrinkrentals.com` |

## Cleanup Candidate Inventory

| Resource group | Pre-cleanup state | Resource count | Classification |
| --- | --- | ---: | --- |
| `rg-pumpkin-api-prod-eastus` | exists | 0 | empty fallback cleanup candidate |
| `rg-pumpkin-api-prod-eastus2` | exists | 0 | empty fallback cleanup candidate |
| `rg-ice-static-form-endpoint` | exists | 3 | legacy endpoint stack, deferred |

`rg-ice-static-form-endpoint` contains:

- `func-ice-static-contact-20260605`
- `EastUSPlan`
- `iceforms20260605`

## Dependency Proof

Repo/source dependency search found no non-document source references for the three cleanup candidate resource group names.

Historical report references exist:

- `rg-pumpkin-api-prod-eastus`: old East US Pumpkin API target attempts and V2.8.35 cleanup candidate records.
- `rg-pumpkin-api-prod-eastus2`: old fallback target attempts and V2.8.35 cleanup candidate records.
- `rg-ice-static-form-endpoint`: legacy static form endpoint reports and registry-style records showing real function/storage resources.

The primary groups were not listed as live resources and were empty at cleanup time. The legacy group was non-empty and explicitly deferred.

## Resource Deletion Result

Deleted:

- `rg-pumpkin-api-prod-eastus`
- `rg-pumpkin-api-prod-eastus2`

Both had zero resources and zero locks before deletion. Both were verified absent after deletion.

Not deleted:

- `rg-ice-static-form-endpoint`, because it is non-empty and still has historical/current legacy endpoint references.

No live resource group was deleted.

## Runtime No-Regression

All checks were GET-only and returned HTTP 200:

- Production apex `/`, `/contact`, `/service-areas`, `/api/static-contact-health`.
- Production www `/`, `/contact`, `/service-areas`, `/api/static-contact-health`.
- Isolated `/api/static-contact-health`.
- Pumpkin API `/health` and `/api/health`.
- Admin UI production `/` and `/login`.

No contact POST occurred.

## Registry Update

Created:

- `deployment/architecture/pumpkin-platform/PUMPKIN_LIVE_RESOURCE_REGISTRY_V2_8_46.md`

The registry records live do-not-delete resources, deleted/absent cleanup candidates, deferred cleanup candidates, and multi-tenant/shared-platform interpretation.

## Security Boundary

No deploy occurred. No contact POST occurred. No content write occurred. No appsetting, DNS, custom-domain, or indexing mutation occurred. No live production/isolated/admin/API/Cosmos/media/monitoring resource was deleted. No Key Vault secret query, storage key/listKeys, SAS generation, connection string generation, protected config read, or owner hard-copy read occurred.

## Files

Created:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_46_RESOURCE_CLEANUP_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-46-resource-cleanup-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_LIVE_RESOURCE_REGISTRY_V2_8_46.md`

## Commit Instructions

Use exact-path staging only:

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_46_RESOURCE_CLEANUP_REPORT.md deployment/architecture/tenant-website-publish-readiness/v2-8-46-resource-cleanup-result deployment/architecture/pumpkin-platform/PUMPKIN_LIVE_RESOURCE_REGISTRY_V2_8_46.md
git commit -m "Document V2.8.46 resource cleanup"
```
