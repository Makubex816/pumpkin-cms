# Promotion Gate Schema

V2.9.2 source of truth: `src/audit-job-ledger-schema.mjs`.

Required fields:

- `gateId`
- `gateType`
- `v2Reference`
- `laneId`
- `requiredEvidence`
- `actualEvidence`
- `state`
- `blockers`
- `approvalReference`
- `rollbackPlanId`
- `result`

Supported states:

- `draft`
- `evidence_collecting`
- `evidence_ready`
- `operator_review`
- `approved_for_explicit_boundary`
- `running`
- `passed`
- `failed`
- `blocked`
- `deferred`
- `complete`
- `closed`
- `cancelled`

Supported results:

- `ready_for_explicit_approval`
- `blocked_missing_evidence`
- `blocked_safety_boundary`
- `deferred_non_blocking`
- `complete`

Rules:

- Every required evidence ID must appear in `actualEvidence`.
- `result: complete` requires `state` to be `passed`, `complete`, or `closed`.
- `result: complete` requires an empty `blockers` array.
- Deferred indexing may be represented as `state: deferred` and `result: deferred_non_blocking`.
