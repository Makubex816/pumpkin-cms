# Phase 2F Evidence Matrix

Status: complete

| Evidence area | Source phase | Result | Key evidence | Remaining gate |
| --- | --- | --- | --- | --- |
| Resource Registry tooling | 2F-12M | complete | Redacted registry, credential references, encrypted local-only vault, handoff writer, validators, checksums. | Real operational retention/signoff. |
| Real redacted inventory | 2F-12N | complete | Real registry and secure handoff generated under ignored `.tmp`; plaintext secret export false. | Keep handoff outside Git; rotate/refresh before real operations. |
| Cosmos provisioning | 2F-12G/12H | complete | `cosmos-pumpkin-prod-eastus`, database `pumpkin-prod-cms`, ten containers, `/tenantKey`, continuous 30-day backup verified. | CMS runtime wiring still blocked. |
| Runtime/provider profile | 2F-12K | complete | Ice classified as provisioned future Cosmos target; live export/runtime switch was blocked by profile at that point. | Separate runtime switch approval and wiring. |
| Seed dry-run | 2F-12O | complete | 27 mapped documents, tenant isolation and `/tenantKey` validation passed. | Live writes required later approval. |
| RBAC and guarded seed retry | 2F-12Q | complete | Approved data-plane RBAC assignment and guarded seed wrote/verified 27 documents; conflicts 0. | No CMS runtime switch. |
| Live Cosmos export proof | 2F-12R | complete | Read-only AAD/RBAC export, 10 record sets, 27 tenant-scoped records, validation passed. | Media was pending until 12S. |
| Media full-copy proof | 2F-12S | complete | 9 approved PNG blobs, 22,639,448 bytes, checksum validation passed. | No live restore performed. |
| Complete standard backup candidate | 2F-12S | complete | Standard bundle, `includesEscrow: false`, 51 content files, database/media/tenant bundle complete. | Owner acceptance and retention plan. |
| Restore-plan proof | 2F-12S | complete | `production-restore-proof` restore plan passed, `dryRunOnly: true`, restore executed false. | Live restore remains blocked. |
| Secure handoff | 2F-12M/12N | ready | Encrypted vault and handoff validated; session JWT excluded from durable escrow. | Production credential escrow remains separate. |
| Hard stops | 2F-12T | active | CMS runtime switch, CMS writes, deployment, indexing, live publication are still not approved. | Future owner approvals only. |

Readiness conclusion:

The Ice standard backup proof is operationally ready for owner signoff. Backup Center can move from proof construction into owner review and next-layer architecture planning. It is not a runtime cutover, restore execution, or live publication approval.
