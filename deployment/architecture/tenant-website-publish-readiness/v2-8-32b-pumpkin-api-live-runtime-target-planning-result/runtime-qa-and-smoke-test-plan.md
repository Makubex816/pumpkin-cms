# Runtime QA And Smoke Test Plan

No runtime QA was executed in V2.8.32B. This is the future approved order.

| Gate | Target | Method | Approval |
| --- | --- | --- | --- |
| API process health | `GET /api/health` | GET only | After deployment approval |
| API root launch probe | `GET /` | GET only, temporary | After deployment approval |
| Provider metadata | `GET /api/admin/provider-metadata` | Approved JWT, read-only | After protected auth approval |
| Admin list | `GET /api/admin/ice-rink-rentals/form-entries` | Approved JWT, read-only | After Admin binding |
| Static health | `/api/static-contact-health` | Isolated SWA first | After isolated binding |
| Static CORS | OPTIONS `/api/static-contact` | Isolated SWA first | After isolated binding |
| Contact write | POST `/api/static-contact` | One no-PII isolated POST | Separate explicit write approval |
| Admin readback | `GET /api/admin/ice-rink-rentals/form-entries/{id}` | Approved JWT, read-only | After write approval |
| Backup proof | Backup/export evidence | Read/export only unless approved | After write-read proof |
| Production smoke | Production `/api/static-contact` | Separate production approval only | Last |

## Pass condition

The contact gate can close only when a controlled contact write returns a Pumpkin API persisted id and Admin returns the same `FormEntry` id from the same API base URL/provider.
