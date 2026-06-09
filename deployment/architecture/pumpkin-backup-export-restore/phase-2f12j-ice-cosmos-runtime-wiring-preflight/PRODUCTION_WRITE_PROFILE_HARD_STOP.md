# Production Write Profile Hard Stop

The `production-write-approved` profile is not available in Phase 2F-12J.

## Required Approvals Before Production Writes

Production runtime writes require separate approval for each step:

1. Runtime profile implementation foundation
2. Runtime read-only verification
3. Seed or migration preflight
4. Seed or migration execution
5. Post-seed readback verification
6. Standard backup and restore validation proof
7. Production runtime switch preflight
8. Production runtime switch execution
9. Live-page publication approval, if applicable

## Abort Conditions

Abort production write planning if:

- Provider metadata is missing or inconsistent.
- Any response contains secret material.
- Cosmos resource names do not match the approved target.
- Partition key path does not match `/tenantKey`.
- Backup policy evidence is missing.
- RBAC or identity requirements are unresolved.
- Source-of-truth data counts are not captured.
- Backup and restore validation proof is missing.

## Current Ice Status

Ice is not approved for production runtime writes. Live pages remain hard-stopped.

