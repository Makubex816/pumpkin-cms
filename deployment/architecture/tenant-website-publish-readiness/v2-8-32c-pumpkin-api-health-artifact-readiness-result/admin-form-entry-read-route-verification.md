# Admin FormEntry Read Route Verification

## Required Route

`GET /api/admin/ice-rink-rentals/form-entries`

## Source Route

`apps/pumpkin-api/Program.cs:1218` registers:

```text
GET /api/admin/{tenantId}/form-entries
```

The required concrete Ice route is satisfied by `tenantId=ice-rink-rentals`.

## Handler Path

- The route requires authorization.
- The route validates the authenticated tenant or `SuperAdmin` role.
- The route calls `databaseService.GetFormEntriesByTenantAsync(tenantId)`.
- The route returns `{ formEntries, count, tenantId }`.

## Boundary

No live Admin read call was performed. No JWT, protected auth value, app setting, or production provider value was read.
