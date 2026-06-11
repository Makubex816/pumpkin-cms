# Active Blockers And Gates

| Gate | Status | Required next step |
| --- | --- | --- |
| OLM first scoped staging write | Blocked | Complete source-of-truth binding and staging target/resource proposal. |
| OLM provider profile | Blocked | Supply approved non-secret profile ID/type/mode. |
| OLM target resource | Blocked | Supply approved non-secret scope/account/database metadata. |
| OLM RBAC/session | Blocked | Supply approved mode/type without secret values. |
| OLM readback/rollback | Blocked | Supply concrete methods tied to first-write batch. |
| Backup Center pre-write | Required | Map approved evidence to future write package. |
| Resource Registry mapping | Required | Map target metadata without values/secrets. |
| Production migration/write | Closed | Requires separate future approval. |
| Deployment/indexing/publication | Closed | Requires separate future approval. |

No gate was bypassed in SOT-01.

