# Audit And Rollback Plans

Approved local simulations append a local audit entry to the sandbox store and write `ACTION_AUDIT_LOG.json` beside the result.

Every action result writes `ROLLBACK_PLAN.json`. The rollback plan contains previous and new values for each simulated change, affected counts, operation ids, and explicit flags:

- `executableAgainstLiveSystems: false`
- `rollbackExecutionImplemented: false`

Rollback output is evidence for future implementation planning only. It is not an executable production rollback tool.
