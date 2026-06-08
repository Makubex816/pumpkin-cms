# Known Limitations

- The builder is still file-based, not an Admin UI wizard.
- Answers validation is implemented in code, not a published JSON Schema.
- Preview/diff is summary-only.
- Catalog fields for approvals and owner contacts are not emitted as extra package JSON until validator package discovery supports those files.
- The builder does not upload or verify media URLs.
- The builder does not create tenants or import content.
- The builder does not perform external checks.
- The builder does not implement `--version`.

These are acceptable for Phase 2B-2 and feed the next Admin UI wizard planning phase.
