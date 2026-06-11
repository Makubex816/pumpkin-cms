# V2.2.3 Partial Stage-ready Carryforward

V2.2.3 carried forward three exact blockers.

| V2.2.3 blocker | V2.2.4 result |
| --- | --- |
| Admin/API runtime not wired to staging-backed read-only OLM state | Resolved through API provider metadata and Admin runtime QA markers. |
| Backup Center staging upload/storage proof not completed | Resolved through uploaded proof using Azure Identity/RBAC. |
| API write-action QA refresh blocked by local build output lock | Resolved by stopping only the repo-local `pumpkin-api` process and rerunning API QA. |

V2.2.3 repeat readback, provider-state, trace/audit/rollback, and no-uncontrolled-write evidence remain valid and were refreshed where required.
