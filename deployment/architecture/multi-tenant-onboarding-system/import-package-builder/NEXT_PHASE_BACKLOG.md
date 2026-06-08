# Next Phase Backlog

Recommended Phase 2B-2 hardening work:

- Publish a formal JSON Schema for answers files.
- Add richer field-level non-technical error explanations for answer validation.
- Add answer normalization previews before generation.
- Support multiple forms when the import package schema and operator model are ready.
- Add richer page block templates with explicit block schema docs.
- Add package diff output for overwrite runs.
- Add optional `--version`.
- Add `--report-out` if reports need to be separated from generated package files.
- Add fixture coverage for custom blocks, redirects, multiple media assets, and canonical `www` host behavior.
- Add a future wizard layer that writes the answers JSON instead of asking non-technical users to edit JSON by hand.

Hard stops that must remain:

- no tenant creation
- no CMS writes
- no MediaAsset writes
- no Azure, Cloudflare, DNS, Function setting, or deployment changes
- no email or Microsoft 365 sending
- no Search Console, sitemap submission, indexing request, or URL Inspection action
- no external checks
- no protected config reads
- Roller remains paused
