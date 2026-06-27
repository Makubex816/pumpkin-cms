# Pumpkin API FormEntry Binding Analysis

Pumpkin API FormEntry write path:

- `Program.cs:304-322` maps `POST /api/forms/{tenantId}/entries`.
- The endpoint extracts `Authorization: Bearer {apiKey}`.
- `PumpkinManager.SaveFormEntryAsync` validates required fields and delegates persistence.
- `CosmosDataConnection.SaveFormEntryAsync` validates the tenant API key against the active tenant record before writing to the `FormEntry` container.

Admin read path:

- `Program.cs:1247-1276` maps `GET /api/admin/{tenantId}/form-entries`.
- The endpoint requires JWT authorization.
- It calls `databaseService.GetFormEntriesByTenantAsync(tenantId)`.
- Cosmos reads from the same `FormEntry` container partitioned by tenant.

Provider/config source findings:

- `Database__Provider` selects `CosmosDb` or `MongoDb`.
- Cosmos mode uses `Database__CosmosDb__ConnectionString` and `Database__CosmosDb__DatabaseName`.
- Admin login/JWT behavior uses `Jwt__SecretKey`, `Jwt__Issuer`, `Jwt__Audience`, and `Jwt__ExpirationMinutes`.

No Pumpkin API app setting maps `PUMPKIN_API_FORMENTRY_PROVIDER_BINDING_SECRET` into FormEntry write behavior. Therefore this phase did not mutate Pumpkin API Web App settings. The static contact tenant key must already match the tenant record in the API's configured database, and that can only be proven by the later approved live POST plus Admin readback gate.
