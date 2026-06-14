# Admin API Bridge Implementation Summary

Implemented files:

- `apps/admin/src/lib/audit-jobs/api-provider.ts`
- `apps/admin/src/lib/audit-jobs/contract-adapter.ts`
- `apps/admin/src/lib/audit-jobs/mock-provider.ts`
- `apps/admin/src/lib/audit-jobs/types.ts`
- `apps/admin/src/components/audit-jobs/AuditJobLedgerAdmin.tsx`
- `apps/admin/src/lib/api.ts`

Behavior:

- fixture mode remains the initial/default state;
- API mode is explicit through `auditJobsProvider=admin-api-readonly` or `auditJobsProvider=api`;
- the bridge uses the existing Admin token and current tenant from `AuthContext`;
- tenant/site can be overridden for safe local QA by query string;
- failures return the existing fixture snapshot with `fallback.attemptedProviderMode` and a reason.

The implementation does not add mutation handlers or write-enabled UI.
