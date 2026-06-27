# Pumpkin API Source Inventory

## Project

| Item | Evidence |
| --- | --- |
| Project | `apps/pumpkin-api/pumpkin-api.csproj` |
| SDK | `Microsoft.NET.Sdk.Web` |
| Target framework | `net10.0` |
| Main packages | JWT Bearer, Azure Cosmos SDK, BCrypt, Newtonsoft.Json, Swashbuckle |
| Model dependency | `apps/pumpkin-net-models/pumpkin-net-models.csproj` |

## Route surface needed for this lane

| Route | Source evidence | Purpose |
| --- | --- | --- |
| `GET /` | `apps/pumpkin-api/Program.cs:159` | Current welcome/root probe only |
| `POST /api/forms/{tenantId}/entries` | `apps/pumpkin-api/Program.cs:252` | Public contact persistence write target |
| `GET /api/admin/provider-metadata` | `apps/pumpkin-api/Program.cs:490` | Authenticated non-secret provider metadata |
| `GET /api/admin/{tenantId}/form-entries` | `apps/pumpkin-api/Program.cs:1195` | Admin lead/contact list |
| `GET /api/admin/{tenantId}/form-entries/{id}` | `apps/pumpkin-api/Program.cs:1227` | Admin lead/contact readback |
| `PATCH /api/admin/{tenantId}/form-entries/{id}` | `apps/pumpkin-api/Program.cs:1259` | Lead workflow status, later use |

## Source gaps before live deployment

| Gap | Plan |
| --- | --- |
| Dedicated health endpoint absent | Add `GET /api/health` returning non-secret service/status/version/environment shape |
| Provider metadata reports future-target runtime wiring | Keep as pre-binding status; update after live API/provider proof |
| Cosmos settings are protected | Bind by setting name or Key Vault reference only; do not print values |
| Tenant CORS is database-driven | Ensure Ice tenant `AllowedOrigins` includes isolated and production origins before browser checks |

## Tests and checks

| Area | Available command or evidence |
| --- | --- |
| API build | `dotnet build apps/pumpkin-api/pumpkin-api.csproj --no-restore` |
| API tests/utilities | `apps/pumpkin-api.Tests` exists but includes credential-generation utilities; use carefully |
| Admin type check | `npm run type-check` in `apps/admin` |
| Static contact compat check | `npm run check` and `npm test` in `deployment/static-azure/forms/static-form-endpoint-compat` |
