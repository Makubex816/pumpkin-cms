# Form Entry Write/Read Topology

## Source topology

```text
Public Contact Form
  -> Static contact managed API (/api/static-contact)
  -> Pumpkin API POST /api/forms/{tenantId}/entries
  -> DatabaseService.SaveFormEntryAsync
  -> Configured provider writes FormEntry
  -> Admin GET /api/admin/{tenantId}/form-entries
  -> DatabaseService.GetFormEntriesByTenantAsync
  -> Admin forms dashboard
```

## Source evidence

| Operation | Source evidence |
| --- | --- |
| Contact write route | `apps/pumpkin-api/Program.cs:252` |
| Admin list route | `apps/pumpkin-api/Program.cs:1195` |
| Admin single entry route | `apps/pumpkin-api/Program.cs:1227` |
| Admin status update route | `apps/pumpkin-api/Program.cs:1259` |
| Save delegate | `apps/pumpkin-api/Services/DatabaseService.cs:56` |
| List delegate | `apps/pumpkin-api/Services/DatabaseService.cs:61` |
| Cosmos save implementation | `apps/pumpkin-api/Services/CosmosDataConnection.cs:422` |
| Cosmos list implementation | `apps/pumpkin-api/Services/CosmosDataConnection.cs:479` |

## Runtime invariant

The write and read paths must use the same tenant id, the same Pumpkin API runtime, and the same provider target. If any of those differ, an accepted contact payload can fail the Admin visibility requirement.

## Required proof

A later approved runtime QA must prove:

1. Static contact forwards to the verified Pumpkin API base URL.
2. Pumpkin API persists into the intended `forms` container.
3. The Admin API returns the same created `FormEntry` id for `ice-rink-rentals`.
4. The Admin UI renders the entry from that API response.
