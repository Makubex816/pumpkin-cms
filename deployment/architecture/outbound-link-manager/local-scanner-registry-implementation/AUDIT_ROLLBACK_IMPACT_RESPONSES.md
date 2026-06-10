# Audit, Rollback, And Publishing Impact Responses

Approved local/fake requests include:

- `ACTION_RESULT.json`
- `API_WRITE_RESPONSE.json`
- `TRACE_LOG.json`
- `PUBLISHING_IMPACT.json`
- `ACTION_AUDIT_LOG.json`
- `ROLLBACK_PLAN.json`

Blocked provider modes still include `API_WRITE_RESPONSE.json`, `TRACE_LOG.json`, `ACTION_RESULT.json`, and `ROLLBACK_PLAN.json` so operators have consistent evidence. Rollback plans are local evidence artifacts only and are not production restore executors.
