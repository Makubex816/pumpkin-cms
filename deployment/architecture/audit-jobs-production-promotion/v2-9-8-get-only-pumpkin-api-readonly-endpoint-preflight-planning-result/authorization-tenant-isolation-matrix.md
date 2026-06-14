# Authorization And Tenant/Site Isolation Matrix

Status: planned only.

Future authorization model should follow the existing Pumpkin API read-only convention:

- request must be authenticated;
- role must be present;
- `tenantKey` and `siteKey` are required query values;
- non-super roles may read only their assigned tenant/site;
- all denials return the read-only envelope with no data payload.

| Role | Allowed future read scope | Mutation access | Notes |
| --- | --- | --- | --- |
| Viewer | Assigned tenant/site dashboard only | none | May read summary, lists, blockers, next gates, and traces for assigned scope. |
| Operator | Assigned tenant/site dashboard and future job detail reads | none | May inspect evidence and promotion context but cannot trigger jobs. |
| TenantAdmin | Assigned tenant/site only | none | May read all Audit Jobs read-only views for assigned tenant/site. |
| SuperAdmin | Cross-tenant summaries only if explicitly authorized | none | Cross-tenant behavior must be separately tested and logged. |
| BackupOperator | Backup/evidence-related views only if explicitly authorized | none | No backup export, restore, or mutation. |

Required error codes:

- `AUDIT_JOB_AUTH_REQUIRED`
- `AUDIT_JOB_FORBIDDEN_ROLE`
- `AUDIT_JOB_FORBIDDEN_TENANT`
- `AUDIT_JOB_FORBIDDEN_SITE`
- `AUDIT_JOB_SCOPE_REQUIRED`

Tenant/site isolation tests must verify wrong-tenant and wrong-site denial before runtime implementation is approved.

