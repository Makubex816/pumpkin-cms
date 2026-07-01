# Next Phase Prompt

Approve V2.8.53S External Compatibility Adapter and Tenant Profile Registry Preflight only.

Use V2.8.53R as the external compatibility map. Keep secondary tenant creation paused.

Scope:

- Add source-level compatibility aliases for missing external routes:
  - `POST /api/forms/{tenantId}/submit/{type}`
  - `GET /api/admin/forms/{tenantId}/entries`
  - `GET /api/admin/forms/{tenantId}/entries/{entryId}`
  - `PUT /api/admin/forms/{tenantId}/entries/{entryId}/status`
- Add tests proving external route aliases and current routes are compatible.
- Verify external contact-style payload compatibility with current FormEntry/FormDefinition models.
- Replace Ice/Roller hard-coded provider/static/publish assumptions with a tenant profile registry or explicitly approved tenant profile map.
- Reconcile ProviderMetadataService container names with source/live evidence.

Not approved:

- External repo mutation.
- External DB mutation or replacement.
- Tenant creation.
- Deploy.
- Azure/appsetting mutation.
- DNS/indexing.
- Contact POST or form submission.
- Media upload.

Acceptance:

- Compatibility adapter proof exists.
- Hard-coded tenant profile remediation plan or implementation exists.
- GET-only no-regression passes.
- Secondary creation remains paused until a separate approval resumes it.
