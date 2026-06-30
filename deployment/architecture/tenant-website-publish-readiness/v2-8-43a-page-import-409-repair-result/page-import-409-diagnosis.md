# Page Import 409 Diagnosis

Result: diagnosed.

The V2.8.43 import used the exported source slug and source document identity for the import attempt. The source create route allowed the synthetic slug with underscores, while the import route normalized target slugs through `PageRedirectGuard`, which strips unsupported characters. That made the import route miss the just-created source page by slug and attempt a new create using the exported page ID. Cosmos then rejected the duplicate document ID with HTTP 409.

Source review also identified an audit-write follow-up risk: the page import route constructed an `ImportRun` without preparing the `id` field. The existing `ImportRunSanitizer` already supplies stable tenant-scoped IDs, so the repair uses it before saving the audit record.
