# Tenant Site Query Behavior

All future API routes require tenant/site scope.

Rules:

- `tenantKey` and `siteKey` are required for package list and package detail.
- Package id must resolve within the same tenant/site scope.
- Mismatched tenant/site returns a read-only forbidden or not-found envelope.
- Roller paused/no-import state is visible only in its scoped tenant/site context.
- Ice candidate state is visible only in its scoped tenant/site context.

No tenant/site query may trigger tenant creation, tenant resume, import execution, or provider lookup.
