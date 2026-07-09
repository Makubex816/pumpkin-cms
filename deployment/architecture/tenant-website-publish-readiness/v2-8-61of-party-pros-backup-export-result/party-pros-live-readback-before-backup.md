# Party Pros Live Readback Before Backup

Readback status: passed.

- Tenant ID: expected `party-pros-philadelphia`, actual `party-pros-philadelphia`
- Tenant status: expected `active`, actual `active`
- Pages: expected 3, actual 3
- MediaAsset records: expected 627, actual 627
- FormDefinition: expected `party-pros-quote-request`, actual present
- Theme: expected `party-pros-orange-slate-v1`, actual present

Read routes used:

- `GET /api/auth/verify`
- `GET /api/admin/tenants/{tenantId}`
- `GET /api/admin/pages?tenantId={tenantId}`
- `GET /api/admin/{tenantId}/media-assets`
- `GET /api/admin/themes/{tenantId}`
- `GET /api/admin/forms/{tenantId}/definitions`
- `GET /api/admin/{tenantId}/form-entries`
- `GET /api/admin/{tenantId}/import-runs`
- `GET /api/admin/{tenantId}/publish-runs`
- `GET /api/admin/tenants/{tenantId}/domain-bindings`
- `GET /api/admin/users?tenantId={tenantId}`

The approved `POST /api/auth/login` was used only to obtain a readback token; source-supported login may update the SuperAdmin last-login timestamp.
