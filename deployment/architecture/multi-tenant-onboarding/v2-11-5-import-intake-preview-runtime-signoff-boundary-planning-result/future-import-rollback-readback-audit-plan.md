# Future Import Rollback Readback Audit Plan

Status: created.

Rollback requirements:

- Every execution manifest must name `RollbackPlanId`.
- Rollback plan must identify reversible actions, non-reversible actions, abort criteria, owner/operator contacts, and evidence retention.
- Rollback execution must require separate approval unless the approved import boundary explicitly includes automatic abort before writes.

Readback requirements:

- Every execution manifest must name `ReadbackPlanId`.
- Readback must verify target tenant/site records, route count, content refs, media refs, form config refs, registry/profile refs, no-go state, and audit trace binding.
- Readback must not crawl external URLs or follow outbound links unless separately approved.

Audit requirements:

- Every future preflight/execution attempt must bind `AuditJobTraceId`.
- The trace must connect approval manifest, package hash, no-go results, execution mode, write attempt count, readback result, rollback/abort decision, and final status.
- Audit events must be redacted and references-only for secrets.

