# Adopt Adapt Defer Reject Matrix

| Decision | Item | Rationale |
| --- | --- | --- |
| Adopt | Upstream commit pin and endpoint inventory | Useful as exact compatibility evidence. |
| Adopt | API endpoint documentation and tests as references | Helps define contract tests for future integration. |
| Adopt | FormBlock rendering concept | Adds a clear renderable form block pattern. |
| Adopt | Starter app as template reference | Useful for future tenant starter strategy. |
| Adapt | `POST /api/forms/{tenantId}/submit/{type}` | Current repo already has route; payload, validation, auth, and readback must match active contracts. |
| Adapt | FormDefinition/FormEntry models | Current data shape and containers must be preserved or migrated intentionally. |
| Adapt | Starter form designer UX | Port useful UX into standalone Admin UI, not wholesale starter admin. |
| Adapt | Admin users/theme controls | Reconcile with current SuperAdmin/TenantAdmin boundaries and existing dashboard routes. |
| Defer | Deploying `apps/starter-app` | Not required for Airstrip cutover; creates new deployment pattern. |
| Defer | Deploying `apps/sample-app-2` | Experimental/template value only at this point. |
| Defer | Public contact/custom form POST proof | Requires later explicit customer-facing form approval. |
| Defer | Embedded starter `/admin` production usage | Conflicts with standalone Admin UI. |
| Reject now | Blind merge from upstream main | Risks route conflicts, deleted active systems, and runtime regressions. |
| Reject now | Replacing current DomainBinding/backup/intake systems | Upstream lacks these systems. |
| Reject now | Combining upstream integration with DNS cutover | Too much blast radius for one phase. |
