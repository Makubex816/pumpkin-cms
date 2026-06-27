# Runtime QA Smoke Test Plan

This is a future plan only. No outbound runtime checks were performed in V2.8.32C.

## Future Order

| Gate | Target | Method | Approval needed |
| --- | --- | --- | --- |
| App Service process health | `GET /api/health` | GET only | After deploy approval |
| Root process health alias | `GET /health` | GET only | After deploy approval |
| Root welcome probe | `GET /` | GET only | After deploy approval |
| Provider metadata | `GET /api/admin/provider-metadata` | Authenticated GET | Protected auth approval |
| Admin FormEntry list | `GET /api/admin/ice-rink-rentals/form-entries` | Authenticated GET | Admin binding approval |
| Isolated static contact health | `/api/static-contact-health` | GET only | Isolated binding approval |
| Isolated static contact CORS | OPTIONS `/api/static-contact` | OPTIONS only | Isolated binding approval |
| Isolated contact write-read proof | POST then Admin GET | One no-PII POST | Separate write approval |

## Contact Gate Pass Condition

The gate closes only when an approved isolated or production contact write creates a Pumpkin `FormEntry` in the same backend/provider that Admin reads, and Admin readback returns the same entry id.
