# Trace Log Completeness Result

Trace matrix scan:

- cases checked: 14
- applied local/fake cases: 9
- blocked cases: 5
- required trace keys present in every case: yes
- audit IDs for applied local/fake cases: yes
- rollback ID for every case: yes
- before/after state hashes for every case: yes
- block reason for blocked cases: yes

Required trace fields verified by generated evidence:

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
- `affectedDomain`
- `normalizedUrl`
- `beforeStateHash`
- `afterStateHash`
- `performedAt`
- `reason`
- `outcome`
- `blockReason`
- `validationResultId`

Note: the missing-approval negative bulk case intentionally has `approvalReference: null`; the field is present and the block reason is `APPROVAL_REFERENCE_REQUIRED`.
