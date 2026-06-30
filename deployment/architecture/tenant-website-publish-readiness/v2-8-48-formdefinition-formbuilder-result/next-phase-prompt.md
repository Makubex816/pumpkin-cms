# Next Phase Prompt

Approve V2.8.49 Admin UI Standalone FormDefinition Workflow Integration only.

Scope:

- Add Admin UI API client methods for `GET/POST/PUT/DELETE /api/admin/forms/{tenantId}/definitions`.
- Wire `/dashboard/form-builder` to list, create, edit, and delete standalone FormDefinition records for the current tenant.
- Keep the existing page/default-definition workflow intact.
- Prove one UI-driven synthetic non-PII FormDefinition create/read/update/delete with cleanup.
- Do not send contact/default-quote-request submissions.
- Do not mutate DNS/custom domains, indexing, appsettings, storage keys/listKeys/SAS/connection strings, Key Vault, protected config, Theme, Page, MediaAsset, ImportRun, PublishRun, or other tenants.
- Do not print or write bearer tokens, tenant API keys, passwords, or cookies.

Carry forward:

- V2.8.48 API/storage lifecycle is complete.
- V2.8.48 Admin UI route is live but standalone FormDefinition CRUD integration remains pending.
