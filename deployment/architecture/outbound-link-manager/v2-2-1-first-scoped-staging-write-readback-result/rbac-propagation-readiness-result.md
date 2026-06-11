# RBAC Propagation Readiness Result

Status: management readback passed; data-plane propagation not verified by repo adapter.

Read-only Azure checks confirmed:

- active subscription display name: `Azure subscription 1`
- resource group `rg-pumpkincms-stg-eastus-olm`: `Succeeded`
- Cosmos account `cosmos-pumpkincms-stg-olm01`: `Succeeded`
- database `pumpkincms-olm-staging`: present
- OLM containers: 10 present
- partition key: `/tenantKey` on every OLM container
- Cosmos data-plane role assignments listed at staging database scope: 2

Assignment inventory:

| Assignment | Principal label | Scope |
| --- | --- | --- |
| `f5d12b8b-9840-42f3-be92-1c64ec06a524` | managed identity `id-pumpkincms-olm-stg` | staging database |
| `ff286a2b-2b67-47eb-b761-4c559df07bac` | operator Azure CLI session principal | staging database |

The actual Cosmos data-plane propagation/readback gate remains blocked because the repo has no live Cosmos readback adapter that can use Azure Identity/RBAC without keys or connection strings.
