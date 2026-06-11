# RBAC Readiness Result

Status: passed.

Safe read-only Azure checks confirmed:

- active subscription display name: `Azure subscription 1`
- resource group `rg-pumpkincms-stg-eastus-olm`: `Succeeded`
- Cosmos account `cosmos-pumpkincms-stg-olm01`: `Succeeded`
- database `pumpkincms-olm-staging`: present
- OLM containers: 10 present
- partition key: `/tenantKey` on every OLM container
- Cosmos data-plane role assignments listed at staging database scope: 2

The live adapter then verified RBAC through the actual data-plane path by writing and reading back the approved batch.
