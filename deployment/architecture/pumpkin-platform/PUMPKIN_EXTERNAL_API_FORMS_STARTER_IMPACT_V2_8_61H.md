# Pumpkin External API Forms Starter Impact V2.8.61H

Status: impact mapped.

Confirmed upstream additions:

- Public forms: `POST /api/forms/{tenantId}/entries`, `GET /api/forms/{tenantId}/definitions/{type}`, `POST /api/forms/{tenantId}/submit/{type}`.
- Admin forms: FormDefinition CRUD and FormEntry list/read/status routes under `/api/admin/forms/{tenantId}/...`.
- Starter app: `apps/starter-app`, including embedded `/admin`, form designer, page editor, theme editor, and contact form block.
- Packages/models: FormDefinition, FormEntry, Theme, FormBlock, and FormBlockView updates.

Compatibility rule:

Adopt concepts and tests, adapt route/model implementation, defer starter deployment and customer-facing form POST proof, reject blind merge.
