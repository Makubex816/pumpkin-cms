# Static Contact Source Delivery Analysis

Source inspected:

- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/validate-static-form-payload.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs`
- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Managers/PumpkinManager.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-net-models/Models/Tenant.cs`

Static-contact delivery flow:

- `deliverStaticFormEntry` selects delivery mode.
- `pumpkin-api` mode calls `forwardToPumpkin`.
- `forwardToPumpkin` requires `PUMPKIN_API_URL`, a protected key env name, the selected key value, and the expected write route.
- The write request sends `Authorization: Bearer <api key>` to Pumpkin API.
- If Pumpkin API response is not successful, the static-contact handler throws and returns HTTP 502.

Pumpkin API write route:

- Route: `/api/forms/{tenantId}/entries`.
- Extracts `Authorization: Bearer <api key>`.
- Calls `PumpkinManager.SaveFormEntryAsync`.
- `FormSubmissionGuard.Sanitize` runs before persistence.
- `CosmosDataConnection.SaveFormEntryAsync` validates the tenant API key before writing to `FormEntry`.
- Tenant API key validation uses BCrypt against `tenant.apiKeyHash`.

Source conclusion:

The Z repair targeted the only redacted secure-file mismatch found in the static delivery bridge: the protected static contact API key raw value differed from its normalized value.
