# Future API Route Matrix

All routes are future GET-only routes.

| Method | Route | Data |
| --- | --- | --- |
| GET | `/api/admin/import-intake/packages` | `ImportIntakePackageSummaryDto[]` |
| GET | `/api/admin/import-intake/packages/{packageId}` | `ImportIntakePackageSummaryDto` |
| GET | `/api/admin/import-intake/packages/{packageId}/preview` | `ImportIntakePreviewDto` |
| GET | `/api/admin/import-intake/packages/{packageId}/validation` | `ImportIntakeValidationDto` |
| GET | `/api/admin/import-intake/packages/{packageId}/no-go` | `ImportIntakeNoGoConditionDto[]` |
| GET | `/api/admin/import-intake/packages/{packageId}/rollback` | `ImportIntakeRollbackDto` |
| GET | `/api/admin/import-intake/packages/{packageId}/evidence` | `ImportIntakeEvidenceRefDto[]` |
| GET | `/api/admin/import-intake/packages/{packageId}/refs` | `ImportIntakeResourceRefDto[]` |

No mutation routes are part of this contract.
