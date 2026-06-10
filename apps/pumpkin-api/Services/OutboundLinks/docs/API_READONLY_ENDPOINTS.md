# API Readonly Endpoints

Phase 2H-9 adds safe GET-only Outbound Link Manager endpoint foundation under `/api/admin`.

Implemented endpoints:

| Method | Path |
| --- | --- |
| GET | `/api/admin/outbound-links` |
| GET | `/api/admin/outbound-links/{id}` |
| GET | `/api/admin/outbound-links/{id}/instances` |
| GET | `/api/admin/outbound-link-instances` |
| GET | `/api/admin/outbound-link-policies` |
| GET | `/api/admin/outbound-link-scan-runs` |
| GET | `/api/admin/outbound-link-audit` |
| GET | `/api/admin/outbound-link-dashboard-summary` |

Supported query values:

- `tenantKey`
- `siteKey`
- `domain`
- `status`
- `pageId`
- `anchorText`
- `firstDetectedFrom`
- `lastDetectedTo`
- `reviewRequired`
- `page`
- `pageSize`
- `sort`
- `sortDirection`

All endpoints use the local/fake read-only provider in this phase. No production database provider is wired.

