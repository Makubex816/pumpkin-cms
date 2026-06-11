# Provider Profile Binding Candidate

This provider profile is a candidate only. It is not an active write profile.

| Profile field | Candidate value | Status |
| --- | --- | --- |
| `profileId` | `olm-staging-cosmos-nosql-v1` | candidate |
| `providerType` | `azure-cosmos-nosql` | candidate |
| `providerMode` | `staging-live-write-approved` | future approval only |
| `resourceScope` | `rg-pumpkincms-stg-eastus-olm` or resource ID after creation | unresolved |
| `accountOrHost` | `cosmos-pumpkincms-stg-olm01` or endpoint hostname after creation | unresolved |
| `databaseOrNamespace` | `pumpkincms-olm-staging` | unresolved |
| `partitionKey` | `/tenantKey` | candidate |
| `authMode` | `entra-rbac-cosmos-data-plane` | unresolved |
| `identityOrSessionType` | `operator-azure-cli-session` or `managed-identity` | unresolved |
| `readbackMethod` | `cosmos-nosql-tenant-site-batch-id-readback` | unresolved |
| `rollbackMethod` | `cosmos-nosql-first-write-batch-delete-or-restore-plan` | unresolved |

## Activation Rule

This candidate must fail closed until the staging resources exist, RBAC/auth is explicit, readback is validated, rollback is bound to `olbatch_b08e184fdc6565aa`, and a separate OLM first-write approval is present.

