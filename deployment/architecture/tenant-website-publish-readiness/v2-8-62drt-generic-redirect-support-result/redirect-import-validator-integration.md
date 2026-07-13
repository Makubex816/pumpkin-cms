# Redirect Import And Validator Integration

The semantic validator now distinguishes a meaningful, resolvable redirect as `persistable_tenant_redirect` instead of treating every non-page-owned mapping as a permanent blocker.

The new import planner:

- accounts for every source declaration;
- emits deterministic idempotency keys and Admin create payloads;
- keeps declaration count separate from persisted object count;
- preserves source file/evidence and import/audit correlation metadata;
- treats exact existing records as no-op resume actions;
- rejects duplicate sources, self-routes, two/multi-node cycles, unsupported statuses, unsafe paths, unsupported schemes, unresolved internal targets, and existing conflicts before write.

The C# page-contract validator accepts a redirect plan only when schema, tenant, status, blocked count, cycle count, action count, endpoint, action fields, evidence, and status code are valid. Without that plan, the historical page-update path still fails closed on the two meaningful mappings.

No import action was executed in DRT.
