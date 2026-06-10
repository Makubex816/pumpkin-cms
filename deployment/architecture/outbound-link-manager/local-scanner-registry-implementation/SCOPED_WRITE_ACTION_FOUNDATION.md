# Scoped Write Action Foundation

Phase 2H-14 adds a write-action foundation without uncontrolled live writes.

Implemented local/offline capabilities:

- API-shaped write preflight requests for review decisions, link status changes, instance status changes, policy updates, scan-run creation, bulk domain actions, page instance actions, and restore-prior-status actions.
- Local/fake/sandbox provider mutation support by delegating approved local requests into cloned `.tmp` stores.
- Tenant, site, role, reason, approval, and provider-mode guards before mutation simulation.
- Response envelopes with request ID, action ID, correlation ID, entity IDs, affected page/instance IDs, audit IDs, rollback ID, before/after state hashes, provider mode, actor identity, and outcome.

The implementation is scoped to local/fake/sandbox provider modes. Live-readonly and live-write-approved modes are blocked in the local package unless a future phase supplies a separately approved provider.
