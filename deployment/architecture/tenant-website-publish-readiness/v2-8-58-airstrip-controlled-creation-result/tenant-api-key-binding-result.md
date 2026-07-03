# Tenant API Key Binding Result

Result: not executed.

Source notes:

- `POST /api/admin/tenants` exists and is SuperAdmin-only.
- `CosmosDataConnection.CreateTenantAsync` generates an API key when key material is absent.
- `POST /api/admin/tenants/{tenantId}/regenerate-api-key` exists and returns a one-time key.

No tenant API key or static contact key was sent, printed, or written. Binding remains pending until a complete source-supported TenantAdmin provisioning path is approved.

