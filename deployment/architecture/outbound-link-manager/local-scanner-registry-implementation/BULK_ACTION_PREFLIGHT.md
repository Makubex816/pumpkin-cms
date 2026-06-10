# Bulk Action Preflight

Bulk preflight simulation supports:

- `bulk_domain_disable`
- `bulk_domain_review`
- `bulk_page_instances`

Bulk actions require an `approvalReference`. Domain actions select matching links and related instances by domain. Page instance actions update matching page instances only and do not change every link record.

The bulk preflight result reports matched link and instance counts, publishing impact, rollback rows for each changed record, and the sandbox store path.

No live bulk action executor exists in Phase 2H-12.
