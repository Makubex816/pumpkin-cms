# Trace Log And Audit Persistence Requirements

Trace and audit persistence must preserve Phase 2H-15 verified fields.

Required trace fields:

- `requestId`
- `actionId`
- `correlationId`
- `tenantKey`
- `siteKey`
- `actorId`
- `actorEmail`
- `actorRole`
- `providerMode`
- `approvalState`
- `approvalReference`
- `outboundLinkId`
- `outboundLinkInstanceId`
- `policyId`
- `policyVersion`
- `scanRunId`
- `reviewDecisionId`
- `bulkActionId`
- `auditEventIds`
- `rollbackPlanId`
- `affectedPageIds`
- `affectedInstanceIds`
- `beforeStateHash`
- `afterStateHash`
- `performedAt`
- `outcome`
- `blockReason`
- `validationResultId`

Persistence requirements:

- no secrets in trace or audit records
- risky URL query values redacted
- blocked actions persisted or reportable with block reason
- audit and trace records linked by request/action/correlation IDs
- rollback IDs persisted before write execution
- trace validation remains available offline
