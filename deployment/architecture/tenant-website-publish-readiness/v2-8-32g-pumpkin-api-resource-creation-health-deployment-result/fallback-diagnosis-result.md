# Fallback Diagnosis Result

Date: 2026-06-27

## Diagnosis

| Area | Result |
| --- | --- |
| Artifact | Verified and ready |
| Linux runtime | `DOTNETCORE|10.0` available |
| Resource group | Exists |
| App Service plan | Creation blocked by quota |
| Web App | Not attempted |
| ZIP deployment | Not attempted |
| Health checks | Not attempted |

## Blocker Details

Azure reported East US Total VMs quota is still `0`.

The requested App Service plan requires `1`.

## Correction Decision

No correction was available within the approved scope. Quota approval, provider registration, RBAC role assignment, alternate region, alternate SKU, and alternate resource names were not approved correction actions for V2.8.32G.

No retry was performed after the quota failure.
