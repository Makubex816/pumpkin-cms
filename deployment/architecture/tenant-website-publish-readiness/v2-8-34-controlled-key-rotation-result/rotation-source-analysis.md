# Rotation Source Analysis

Tenant/static contact validation is single-key.

Source-discovered Pumpkin API path:

- Write route: `/api/forms/{tenantId}/entries`.
- API key is read from the `Authorization: Bearer <apiKey>` header.
- `CosmosDataConnection.ValidateTenantApiKeyAsync` reads the `Tenant` container.
- Validation query requires `tenantId`, `status = 'active'`, and `apiKeyMeta.isActive = true`.
- The supplied key is verified with `BCrypt.Net.BCrypt.Verify(apiKey, tenant.ApiKeyHash)`.

Source-discovered Tenant fields:

- `id`
- `tenantId`
- `status`
- `apiKey`
- `apiKeyHash`
- `apiKeyMeta.createdAt`
- `apiKeyMeta.isActive`
- `updatedAt`

Static contact bridge settings:

- `FORM_DELIVERY_MODE`
- `PUMPKIN_API_URL`
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE`
- `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME`
- `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`
- `STATIC_FORM_ALLOWED_SITE_KEYS`
- `STATIC_FORM_ALLOWED_ORIGINS`

Blocked-isolated diagnosis:

The isolated POST returned HTTP 400. Source review shows the static bridge preserves upstream 400 responses from Pumpkin API, and Pumpkin API `FormSubmissionGuard` requires the `default-quote-request` form data fields `fullName`, `email`, `phone`, `eventCity`, `eventState`, `eventDateOrDateRange`, `eventType`, `venueSetting`, `message`, and `consent`. The V2.8.34 synthetic payload used a simplified operator prompt shape, so the likely failure zone is payload contract mismatch, not proven key auth failure.
