# Next Phase Backlog

Recommended next work:

- Publish a formal JSON Schema for answers files.
- Add answer normalization previews before generation.
- Add full line-by-line diff export for planned overwrites.
- Add optional `--version`.
- Add `--report-out` if reports need to be separated from generated package files.
- Add richer custom block templates with explicit block schema docs.
- Add fixture coverage for redirects and canonical `www` host behavior.
- Add optional generated `owner-contacts.json` and `approvals.json` only after validator discovery and schemas authorize those files.
- Add an Admin UI wizard layer that writes the answers JSON instead of asking non-technical users to edit JSON by hand.

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
