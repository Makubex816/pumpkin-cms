# Audit Event View Model

Audit event rows are derived from `ledger.auditEvents`.

## Fields

- `id`
- `type`
- `outcome`
- `occurredAt`
- `actor`
- `boundaryClass`
- `mutationClass`
- `evidenceRefs`
- `evidenceSummaries`
- `traceIdCount`
- `correlationId`
- `boundaryGateId`
- `readOnlySafety`

## Purpose

The audit event panel lets an operator inspect what happened, which evidence backs it, which trace IDs correlate it, and whether the local no-write safety boundary stayed closed.

## Invalid Ledger Behavior

Unsupported event types remain visible in read-only mode and are paired with validation warnings and an `INVALID_LEDGER` blocker.
