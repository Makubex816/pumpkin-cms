# Backup Before Migration Requirements

Backup Center is the safety foundation before any migration or live write.

Required before migration execution:

- complete tenant standard backup candidate
- outbound link files included in backup candidate
- checksum manifest
- restore-plan validation
- resource registry snapshot
- operator summary
- owner signoff
- retention/cleanup plan

Outbound Link Manager backup files expected:

- `cms-content/outbound-links.json`
- `cms-content/outbound-link-instances.json`
- `cms-content/outbound-link-policies.json`
- `cms-content/outbound-link-scan-runs.json`
- `cms-content/outbound-link-audit-summary.json`
- `cms-content/outbound-link-render-decisions.json`
- `cms-content/outbound-link-validation-report.json`

Migration execution must be blocked if the backup is stale, incomplete, missing checksums, or missing restore validation.
