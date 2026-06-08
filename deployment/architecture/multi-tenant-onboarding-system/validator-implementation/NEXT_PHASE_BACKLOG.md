# Next Phase Backlog

Recommended next work is Phase 2B import package wizard planning/implementation, still offline-first unless separately approved.

Backlog:

- Add an operator import-package wizard that gathers required files and runs this validator before handoff.
- Add fixture catalog documentation for package authors and support teams.
- Add snapshot tests for Markdown support packet output once the operator copy settles.
- Add report schema validation once the normalized gate status vocabulary is aligned in schema.
- Add deployment profile reference validation and environment-variable classification as offline checks.
- Add offline profile smoke-test fixtures.
- Add extension manifest, permission, and migration schema validation or explicit blocking deferral.
- Add stricter page block reference contracts once block schemas are available.
- Decide whether to add a production JSON Schema validator dependency under a separate approval.

Still not included without later approval:

- tenant creation
- CMS writes
- MediaAsset writes
- Azure changes
- Cloudflare changes
- DNS changes
- deployment
- Function App setting changes
- email or Microsoft 365 work
- Search Console, sitemap, indexing, or URL Inspection actions
- external HTTP checks
- Roller work
