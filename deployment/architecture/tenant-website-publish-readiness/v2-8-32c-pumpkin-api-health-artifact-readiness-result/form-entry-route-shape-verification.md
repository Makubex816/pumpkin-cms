# FormEntry Route Shape Verification

## Required Route

`POST /api/forms/ice-rink-rentals/entries`

## Source Route

`apps/pumpkin-api/Program.cs:275` registers:

```text
POST /api/forms/{tenantId}/entries
```

The required concrete Ice route is satisfied by `tenantId=ice-rink-rentals`.

## Handler Path

- The route extracts the Bearer API key from the Authorization header.
- The route accepts a `FormEntry` body.
- The route calls `PumpkinManager.SaveFormEntryAsync`.
- The database abstraction calls `SaveFormEntryAsync` on the configured provider.

## Boundary

No contact form POST or production API write was performed in V2.8.32C. This was route-shape verification only.
