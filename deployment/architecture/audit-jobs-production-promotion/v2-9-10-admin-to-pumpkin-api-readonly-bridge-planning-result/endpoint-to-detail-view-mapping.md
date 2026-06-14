# Endpoint To Detail View Mapping

| Detail record kind | Source endpoint | Detail fields |
| --- | --- | --- |
| `audit_event` | `/events` | `id`, `type`, `outcome`, `occurredAt`, `actor`, `boundaryClass`, `mutationClass`, `evidenceRefs`, `evidenceSummaries`, `correlationId`, `boundaryGateId`, read-only safety. |
| `job_run` | `/job-runs` | `id`, `type`, `status`, `outcome`, `startedAt`, `completedAt`, `auditEventIds`, `evidenceRefs`, `evidenceCount`, `evidenceSummaries`, read-only safety. |
| `promotion_gate` | `/promotion-gates` | `id`, `type`, `state`, `result`, `blockers`, `requiredEvidence`, `actualEvidence`, `missingEvidenceRefs`, `approvalReference`, `rollbackPlanId`, evidence summaries. |
| `evidence_binding` | `/evidence-bindings` | `id`, `type`, `sourceRef`, `safePath`, `summary`, `hasArtifactHash`. |
| `trace_id` | `/traces` | `field`, `value`, `auditEventId`, `eventType`, `correlationId`, search text. |

The existing Admin detail panel can continue to render normalized `AuditJobLedgerAdminRecord` rows. V2.9.11 should implement normalization from API responses into the same record shape rather than building new UI-specific detail models.

The detail panel must remain read-only and must never include mutation buttons, live links that crawl outbound URLs, raw credential material, or protected config values.

