# Provider Profile Binding Candidate

This is a non-secret provider profile candidate for future activation. It is not an active write profile yet.

| Profile field | Candidate value | Status |
| --- | --- | --- |
| `profileId` | `olm-staging-cosmos-nosql-v1` | candidate |
| `providerType` | `azure-cosmos-nosql` | resolved |
| `providerMode` | `staging-live-write-approved` | future approval only |
| `resourceScope` | `resourceGroup:rg-pumpkincms-stg-eastus-olm` | resolved |
| `accountOrHost` | `cosmos-pumpkincms-stg-olm01.documents.azure.com` | resolved |
| `databaseOrNamespace` | `pumpkincms-olm-staging` | resolved |
| `partitionKey` | `/tenantKey` | resolved |
| `authMode` | `entra-rbac-cosmos-data-plane` | unresolved until RBAC assignment |
| `identityOrSessionType` | `managed-identity:id-pumpkincms-olm-stg` | candidate; RBAC pending |
| `readbackMethod` | `cosmos-nosql-tenant-site-batch-id-readback` | method candidate |
| `rollbackMethod` | `cosmos-nosql-first-write-batch-delete-or-restore-plan` | method candidate tied to batch |

Activation remains blocked until RBAC and first-write approval are both present.

