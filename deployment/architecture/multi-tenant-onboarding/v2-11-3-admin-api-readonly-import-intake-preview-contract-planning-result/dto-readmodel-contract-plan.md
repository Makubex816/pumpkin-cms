# DTO Read Model Contract Plan

Future DTOs:

- `ImportIntakePackageSummaryDto`
- `ImportIntakePreviewDto`
- `ImportIntakeValidationDto`
- `ImportIntakeNoGoConditionDto`
- `ImportIntakeRollbackDto`
- `ImportIntakeEvidenceRefDto`
- `ImportIntakeResourceRefDto`
- `ImportIntakeRouteContentDto`
- `ImportIntakeReadOnlyEnvelopeDto`

Read-model rules:

- DTOs mirror the shared model where possible.
- Evidence/resource refs remain references, not secret-bearing payloads.
- Route/content/media/form arrays are read-only.
- No DTO includes a command, action token, write endpoint, provider credential, or import executor instruction.
