# Admin FormEntry Authenticated Readback Preflight

Preflight route:

`GET /api/admin/ice-rink-rentals/form-entries`

Authorization:

Bearer token from live Admin login, held only in memory.

Result:

- HTTP status: 500.
- Content type: `application/problem+json`.
- Token printed or written: no.

Sanitized failure summary:

- Error while retrieving form entries.
- Cosmos returned NotFound for the source-required `FormEntry` container.
- Source path: `CosmosDataConnection.GetFormEntriesByTenantAsync` uses `_database.GetContainer("FormEntry")`.

Hard-stop result:

Authenticated Admin FormEntry readback failed, so V2.8.32W stopped before the production contact POST.
