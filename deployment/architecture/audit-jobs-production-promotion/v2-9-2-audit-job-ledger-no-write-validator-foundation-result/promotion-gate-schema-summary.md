# Promotion Gate Schema Summary

Result: implemented.

The promotion gate schema is defined in:

```text
deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/src/audit-job-ledger-schema.mjs
deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/schemas/promotion-gate.schema.md
```

Required fields include `gateId`, `gateType`, `v2Reference`, `laneId`, `requiredEvidence`, `actualEvidence`, `state`, `blockers`, `approvalReference`, `rollbackPlanId`, and `result`.

Implemented rules:

- Actual evidence must cover required evidence.
- `result: complete` requires `state` to be `passed`, `complete`, or `closed`.
- Complete gates must not retain blockers.
- Indexing deferral can be represented as `state: deferred` and `result: deferred_non_blocking`.
