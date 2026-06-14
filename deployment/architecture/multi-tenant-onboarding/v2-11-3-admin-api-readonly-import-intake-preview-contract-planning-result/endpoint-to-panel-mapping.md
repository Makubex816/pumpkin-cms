# Endpoint To Panel Mapping

| Admin panel | Primary future endpoint |
| --- | --- |
| Import Package Summary | `GET /api/admin/import-intake/packages/{packageId}` |
| Tenant Lifecycle | `GET /api/admin/import-intake/packages/{packageId}/preview` |
| Routes and Content | `GET /api/admin/import-intake/packages/{packageId}/preview` |
| Media References | `GET /api/admin/import-intake/packages/{packageId}/refs` |
| Forms and Contact Configuration | `GET /api/admin/import-intake/packages/{packageId}/refs` |
| Resource Registry / Provider Profile | `GET /api/admin/import-intake/packages/{packageId}/refs` |
| Backup Center | `GET /api/admin/import-intake/packages/{packageId}/evidence` |
| Runtime QA | `GET /api/admin/import-intake/packages/{packageId}/evidence` |
| Outbound Link Manager | `GET /api/admin/import-intake/packages/{packageId}/refs` |
| Audit Jobs / Promotion Governance | `GET /api/admin/import-intake/packages/{packageId}/evidence` |
| No-Go Conditions | `GET /api/admin/import-intake/packages/{packageId}/no-go` |
| Rollback / Abort | `GET /api/admin/import-intake/packages/{packageId}/rollback` |
| Security and Redaction | `GET /api/admin/import-intake/packages/{packageId}/validation` |
| Paused Tenant / Resume Governance | `GET /api/admin/import-intake/packages/{packageId}/no-go` |
| Next Gates | `GET /api/admin/import-intake/packages/{packageId}/preview` |
