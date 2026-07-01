# FormEntry PII Backup Classification

Classification: `covered_protected_pii_bundle_only`

The protected backup includes 4 FormEntry records. FormEntry contents may include personal information and were not copied into repo reports.

Restore handling requirements:

- Explicit approval before restoring FormEntries into any live target.
- Target tenant and retention intent must be documented.
- Operator must validate that restored entries are appropriate for the target tenant.
- Repo-facing evidence may include only counts, timestamps, route names, hashes, and classifications.
