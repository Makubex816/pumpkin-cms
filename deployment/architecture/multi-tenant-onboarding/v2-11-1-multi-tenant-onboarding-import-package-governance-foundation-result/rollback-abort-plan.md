# Rollback Abort Plan

Every tenant package must include `rollbackPlanId`.

Minimum future rollback/abort model:

- abort before import if validation fails;
- abort before CMS/provider writes unless explicit write approval exists;
- abort before deployment/DNS/indexing/contact POST unless separate approval exists;
- preserve evidence package and validation output;
- record owner/operator decision;
- keep paused tenants unchanged.

V2.11.1 does not execute rollback because it does not execute imports or writes.
