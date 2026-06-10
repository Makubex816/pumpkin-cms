# Audit Rollback Result

Approved simulations write:

- `ACTION_AUDIT_LOG.json`
- sandbox-store audit log append
- `ROLLBACK_PLAN.json`
- `ROLLBACK_PLAN_SUMMARY.json`

Rollback plans record previous and new values and explicitly set:

- `executableAgainstLiveSystems: false`
- `rollbackExecutionImplemented: false`

Blocked simulations write rollback stubs without sandbox store mutation.
