# V2.9.11 Carryforward

V2.9.11 is the implementation baseline for this closeout.

Committed baseline:

- `49be0e4 Implement V2.9.11 audit ledger admin API bridge`

Carried forward as complete:

- Admin GET-only API bridge client added at `apps/admin/src/lib/audit-jobs/api-provider.ts`.
- Admin contract adapter accepts `admin-api-readonly` and `api-local-fixture-readonly` together.
- Fixture fallback remains default and visible as degraded state when API mode cannot complete.
- Admin API mode is selectable by `/dashboard/audit-jobs?auditJobsProvider=admin-api-readonly`.
- Existing Admin auth/current tenant context remains the boundary for API mode.
- V2.9.11 scoped harness exists at `apps/admin/scripts/v2-9-11-audit-job-ledger-api-bridge-check.mjs`.
- Local API runtime blocker from eager TenantCors database resolution was remediated with scoped lazy resolution.

V2.9.11 did not add new API routes, mutation endpoints, live providers, write behavior, deployment, indexing, contact POST, Azure mutation, protected config access, token/key use, or Electron runtime behavior.
