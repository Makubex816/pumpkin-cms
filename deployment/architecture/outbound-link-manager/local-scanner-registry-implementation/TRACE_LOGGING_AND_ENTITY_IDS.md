# Trace Logging And Entity IDs

Every Phase 2H-14 write preflight emits trace context:

- request ID
- action ID
- correlation ID
- tenant key
- site key
- actor identity
- actor role
- provider mode
- action name
- outbound link ID
- instance ID
- policy ID
- scan-run ID
- bulk-action ID
- audit IDs
- rollback-plan ID
- before state hash
- after state hash
- affected page IDs
- affected instance IDs
- outcome

URL values in trace data redact risky query keys such as token, key, signature, auth, password, access_token, and code.
