# DTO And Read-Model Implementation Summary

Implemented in:

`apps/pumpkin-api/Services/AuditJobs/AuditJobApiContracts.cs`

Implemented DTO/read-model types include:

- `AuditJobViewerSummaryDto`
- `AuditEventDto`
- `JobRunDto`
- `PromotionGateDto`
- `EvidenceBindingDto`
- `TraceEntryDto`
- `AuditJobWarningDto`
- `AuditJobBlockerDto`
- `AuditJobNextGateDto`
- `ReadOnlyApiEnvelopeDto<T>`

List response wrappers were added for events, job runs, promotion gates, evidence bindings, traces, blockers, and next gates.

The read model is derived from the validated V2.9.6 fixture envelope rather than rebuilding audit ledger logic.

