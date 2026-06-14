# Trace ID Validation Summary

Result: implemented.

Trace ID requirements are defined in:

```text
deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/src/audit-job-ledger-schema.mjs
deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/schemas/trace-id-requirements.md
```

Common event trace IDs:

- `v2Reference`
- `laneId`
- `tenantKey`
- `siteKey`
- `auditEventId`
- `correlationId`
- `approvalReference`
- `outcome`

Event-specific trace IDs include artifact run/hash, deployment ID, route check ID, job run ID, Runtime QA run ID, Resource Registry validation ID, Provider Profile validation ID, OLM validation ID, rollback plan ID, and boundary gate ID where applicable.

The validator checks required trace fields and verifies that duplicate parent fields match the event record.
