# Admin FormEntry Alias Proof Result

Admin aliases proved:

- `GET /api/admin/forms/{tenantId}/entries`
- `GET /api/admin/forms/{tenantId}/entries/{entryId}`

Readback result:

| Check | Status |
| --- | --- |
| Admin alias list readback | HTTP 200 |
| Filtered list count | 1 |
| Trace or entry found in list | yes |
| Admin alias detail readback | HTTP 200 |
| Detail trace matched | yes |

The bearer material used for readback was kept in memory only and was not printed or written.
