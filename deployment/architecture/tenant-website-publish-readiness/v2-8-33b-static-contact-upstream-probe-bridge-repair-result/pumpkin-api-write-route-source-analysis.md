# Pumpkin API Write Route Source Analysis

Source inspected:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Managers/PumpkinManager.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-net-models/Models/Tenant.cs`
- `apps/pumpkin-api/Services/FormSubmissionGuard.cs`

Findings:

- Public FormEntry write route: `/api/forms/{tenantId}/entries`.
- Authorization header shape: `Authorization: Bearer <tenant api key>`.
- Source-required tenant auth store: Cosmos container `Tenant`.
- Tenant lookup requires `tenantId`, `status = active`, and `apiKeyMeta.isActive = true`.
- Tenant key verification uses BCrypt against `apiKeyHash`.
- Write persistence target is the `FormEntry` container with partition key `tenantId`.
- Malformed payload validation runs before tenant-key verification, so a 400 from an intentionally invalid write payload proves route/validation reachability but not complete key acceptance.

Tenant alignment schema:

- `id`
- `tenantId`
- `status`
- `apiKey`
- `apiKeyHash`
- `apiKeyMeta.createdAt`
- `apiKeyMeta.isActive`
- `updatedAt`
