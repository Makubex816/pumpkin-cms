# DTO And Read-Model Contract Plan

Status: planned only.

Future DTOs:

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

Future list wrapper DTOs:

- `AuditEventListDto` with `items`;
- `JobRunListDto` with `items`;
- `PromotionGateListDto` with `items`;
- `EvidenceBindingListDto` with `items`;
- `TraceEntryListDto` with `items`;
- `AuditJobBlockerListDto` with `items`;
- `AuditJobNextGateListDto` with `items`.

Required shared fields:

- all DTOs with tenant/site fields must expose `tenantKey` and `siteKey` only from the authorized request scope;
- all timestamps should serialize as ISO 8601 strings;
- all evidence paths must remain safe relative paths or known evidence IDs;
- all trace values must be non-secret IDs already present in the V2.9.6 validated fixture;
- no DTO may expose raw secret, token, cookie, credential, connection material, key material, or protected config content.

Read-model source:

- initial runtime implementation should load from a fixture-backed read model that mirrors `valid-v2-8-combined-readonly-api-envelope.fixture.json`;
- future provider-backed read model must emit the same DTO shape and pass the same contract validator;
- every route should be derivable from the shared viewer model instead of rebuilding audit logic independently.

