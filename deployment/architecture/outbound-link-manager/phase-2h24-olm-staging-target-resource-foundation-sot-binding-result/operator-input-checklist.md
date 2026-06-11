# Operator Input Checklist

Provide non-secret values only. Do not paste keys, connection strings, SAS URLs, tokens, cookies, auth headers, private keys, deployment tokens, or protected config contents.

Required non-secret inputs:

- approved real scoped staging provider profile ID
- concrete staging provider type
- scoped staging write-approved provider mode
- non-production resource scope
- non-production account or host identifier
- non-production database or namespace identifier
- RBAC/session mode label
- identity/session type label
- approved readback method name
- approved rollback method name tied to `olbatch_b08e184fdc6565aa`

Required confirmations:

- target is not production
- provider mode is not `staging-simulated`
- provider mode is not `production-runtime`
- Backup Center pre-write evidence is available
- Resource Registry mapping can be created without secrets
- Runtime QA can run without protected config

