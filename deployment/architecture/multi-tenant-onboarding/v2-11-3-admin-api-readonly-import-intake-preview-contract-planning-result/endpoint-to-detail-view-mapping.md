# Endpoint To Detail View Mapping

Detail views:

- Package detail: identity, lifecycle, import mode, readiness, owner approval, source path.
- Route detail: route path, content refs, form refs, warnings.
- Reference detail: ref kind, source system, evidence category, safe path label.
- No-go detail: code, severity, blocked action, operator explanation, next gate.
- Rollback detail: rollback plan id, abort state, required future approvals.
- Security detail: closed flags, redaction policy, protected config status, no-write status.

Each detail view opens from read-only data already loaded from GET endpoints or fixture fallback.

No detail view may expose an enabled write command.
