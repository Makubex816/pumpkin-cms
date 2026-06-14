# Authorization And Tenant/Site Isolation Result

Implemented authorization:

`AuditJobAuthorizationService`

Allowed read roles:

- Viewer
- Operator
- TenantAdmin
- SuperAdmin
- BackupOperator

Behavior:

- unauthenticated requests return `AUDIT_JOB_AUTH_REQUIRED`;
- unsupported roles return `AUDIT_JOB_FORBIDDEN_ROLE`;
- wrong tenant returns `AUDIT_JOB_FORBIDDEN_TENANT`;
- wrong site returns `AUDIT_JOB_FORBIDDEN_SITE` when a site claim is present;
- `SuperAdmin` can read cross-scope fixture data;
- tenant/site query values are required before service access.

