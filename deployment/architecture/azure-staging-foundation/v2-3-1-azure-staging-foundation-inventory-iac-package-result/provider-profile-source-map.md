# Provider Profile Source Map

The future staging provider profile must be assembled from non-secret IaC outputs, operator-approved target metadata, and guarded runtime/provider mode configuration.

| Provider profile field | Source | Secret allowed in repo | Notes |
| --- | --- | --- | --- |
| `profileId` | Provider profile registry | no | Suggested candidate: `olm-staging-cosmos-nosql-v1`. |
| `providerType` | IaC output contract | no | Expected candidate: `azure-cosmos-nosql`. |
| `providerMode` | Provider mode gate | no | Must be explicit: `staging-live-write-approved` only for scoped execution. |
| `resourceScope` | Resource group/account approval worksheet | no | Non-secret Azure resource identifier or name. |
| `accountOrHost` | IaC output or approved existing staging target | no | Account name or host only; no connection string. |
| `databaseOrNamespace` | IaC output or approved existing staging target | no | Non-production database or namespace. |
| `containers` | IaC output contract | no | Container names and partition keys only. |
| `authMode` | RBAC and identity plan | no | Entra/RBAC based; no keys or SAS. |
| `identityOrSessionType` | RBAC and identity plan | no | Operator CLI session or managed identity label only. |
| `readbackMethod` | Readback method plan | no | Batch and tenant/site scoped. |
| `rollbackMethod` | Rollback method plan | no | Tied to `olbatch_b08e184fdc6565aa`. |
| `backupEvidenceRef` | Backup Center pre-write evidence | no | File/reference only. |
| `resourceRegistryRef` | Resource Registry staging mapping | no | Redacted target metadata only. |
| `runtimeQaEvidenceRef` | Runtime QA evidence map | no | Evidence path or manifest only. |

## Profile Gate

The profile must fail closed unless all required first-write values are present and the mode is explicitly approved for the scoped staging batch. Live-readonly and staging-simulated profiles must remain unable to perform real staging writes.

