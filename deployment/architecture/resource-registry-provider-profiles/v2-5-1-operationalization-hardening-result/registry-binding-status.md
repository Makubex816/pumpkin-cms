# Registry Binding Status

| Binding target | State | Notes |
| --- | --- | --- |
| Outbound Link Manager | current | Bound to `olm-staging-cosmos-nosql-v1`, 48-record approved batch, and V2.2.5 evidence. |
| Backup Center | current | Storage proof prefix was uploaded in V2.2.4 and read-only verified in V2.2.5/V2.5.1. |
| Resource Registry | container exists, upload not executed | `resource-registry-staging` exists; V2.5.1 did not upload registry artifacts. |
| Runtime QA | container exists, upload not executed | `runtime-qa-staging` exists; V2.5.1 did not upload runtime QA artifacts. |
| Admin/API | current | Read-only bridge and write-action guard QA carried forward from V2.2.5. |
| Azure Staging Foundation | current | Resource group, Cosmos, storage, identity, diagnostics, and containers are represented by non-secret names. |

