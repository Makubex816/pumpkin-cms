# Local Test Validation Result

## Command

```powershell
dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -c Release -- --v2-8-32c
```

## Result

Passed.

```text
V2.8.32C Pumpkin API health and route readiness checks passed.
```

## Coverage

The scoped runner verifies:

- `IResult GetHealth()` exists.
- `GET /api/health` exists.
- `GET /health` exists.
- Health response includes service identity and process health fields.
- Health source does not depend on database services or configuration reads.
- `POST /api/forms/{tenantId}/entries` exists.
- `GET /api/admin/{tenantId}/form-entries` exists.
- Admin FormEntry list route requires authorization and reads tenant-scoped entries.
