# Phase 2F-12G Cosmos Provisioning Execution Report

## Result

Phase 2F-12G executed the approved Azure provisioning scope. The first attempt hit a provider-registration blocker, then the owner explicitly approved registering `Microsoft.DocumentDB`, and provisioning resumed.

Approved Azure mutation occurred:

- Resource group `rg-ice-production-cosmos` exists in `eastus`.
- Provider namespace `Microsoft.DocumentDB` is registered.
- Cosmos account `cosmos-pumpkin-prod-eastus` exists.
- Database `pumpkin-prod-cms` exists.
- Ten approved containers exist with `/tenantKey`.
- Continuous backup is enabled with tier `Continuous30Days`.

## Azure Context

| Field | Value |
| --- | --- |
| Environment | `AzureCloud` |
| Subscription name | `Azure subscription 1` |
| Subscription ID | `ff887def-fd83-4a19-9298-13d4b1687873` |
| Tenant ID | `38b16667-a82c-4ff8-98d8-aeebbec4536a` |

## Resource Group

| Field | Value |
| --- | --- |
| Name | `rg-ice-production-cosmos` |
| Location | `eastus` |
| Provisioning state | `Succeeded` |
| Resource ID | `/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-ice-production-cosmos` |

## Cosmos Account

| Field | Value |
| --- | --- |
| Name | `cosmos-pumpkin-prod-eastus` |
| Location | `East US` |
| Provisioning state | `Succeeded` |
| Kind | `GlobalDocumentDB` |
| Consistency policy | `Session` |
| Public network access | `Enabled` |
| Backup policy | `Continuous` |
| Continuous tier | `Continuous30Days` |
| Document endpoint | `https://cosmos-pumpkin-prod-eastus.documents.azure.com:443/` |

## Database And Containers

| Item | Result |
| --- | --- |
| Database | `pumpkin-prod-cms` created |
| Database shared throughput | 400 RU/s |
| Partition key | `/tenantKey` |
| Containers | `tenants`, `sites`, `pages`, `routes`, `forms`, `mediaAssets`, `themes`, `publishRuns`, `importRuns`, `users` |

All ten containers were read back with `/tenantKey` and consistent indexing.

## Readiness Classification

- Phase 2F-12F provisioning approval package: complete
- Phase 2F-12G Cosmos provisioning execution: complete
- Resource group exists: yes
- Cosmos account exists: yes
- Database exists: yes
- Containers exist: yes
- Provider resolver refresh ready: yes, for a later read-only approval
- CMS runtime switch performed: no
- Ice data migration performed: no
- Live database connector execution ready: no
- Ice fully backupable today: no
- Live pages affected: no

## Security Boundary

No keys/listKeys commands, connection strings, SAS generation, protected config reads, CMS writes, MediaAsset writes, data migration, database export/import, Cosmos document export, Cloudflare/DNS changes, deployment, Function App setting changes, email/Microsoft 365 work, Search Console/indexing, or live-page publication occurred.

Nothing was staged in Git.

## Next Approval

The next appropriate gate is a read-only provider resolver refresh for Ice/Pumpkin Cosmos metadata. That does not approve CMS runtime wiring, data migration, database export/import, RBAC changes, deployment, Search Console/indexing, or live-page publication.

