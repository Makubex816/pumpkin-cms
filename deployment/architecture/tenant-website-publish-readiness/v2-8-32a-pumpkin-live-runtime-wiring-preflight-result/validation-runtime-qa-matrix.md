# Validation Runtime QA Matrix

This matrix is for later approved runtime QA. V2.8.32A did not run production API calls or contact writes.

| QA item | Target | Current status | When to run |
| --- | --- | --- | --- |
| API host metadata | Azure resource inventory | Web App missing in current metadata | Next phase |
| API health or root check | Verified Pumpkin API URL | Not run | After API host approval |
| Provider metadata check | Pumpkin API non-secret metadata endpoint | Not run | After API host approval |
| Admin form-entry list | Admin API route | Not run | After Admin base URL binding approval |
| Static contact health | Isolated SWA managed API | Not run | After isolated static contact binding |
| OPTIONS/CORS check | Isolated SWA origin to static contact/API | Not run | After allowed origins are configured |
| Controlled contact POST | Isolated lane first | Not run | After all read-only checks pass |
| Admin id visibility | Same entry id from controlled POST | Not run | Immediately after approved test write |
| Backup/export observability | Backup Center or export path | Not run | After approved test write |
| Production smoke | Production public contact | Not run | Separate production approval only |

## Pass condition for contact persistence

A future approved controlled write must return a Pumpkin API persisted id, and the same id must be visible through Admin's form-entry read path for `ice-rink-rentals`.
