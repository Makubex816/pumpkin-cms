# Tenant JSON Expectations

`tenant.json` defines the durable tenant identity.

Required:

- `schemaVersion`
- `tenantId`
- `siteKey`
- `displayName`
- `businessType`
- `cmsTenantSlug`
- `status`

Optional:

- `relatedTenants`
- `pausedRelatedTenants`
- `owners`
- `notes`

Forbidden:

- real tenant API key values
- admin JWTs
- passwords
- connection strings
- provider tokens

Use `TENANT_API_KEY_RUNTIME_ONLY` only as a placeholder in examples.
