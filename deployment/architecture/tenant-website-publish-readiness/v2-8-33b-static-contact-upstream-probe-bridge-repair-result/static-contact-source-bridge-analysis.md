# Static Contact Source Bridge Analysis

Source inspected:

- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/validate-static-form-payload.mjs`

Findings:

- The bridge supports `FORM_DELIVERY_MODE=pumpkin-api`.
- The bridge reads the protected key through `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME`.
- The bridge forwards FormEntry JSON to `PUMPKIN_API_URL` plus `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE`.
- Before repair, any upstream non-OK Pumpkin API response was thrown and collapsed to public HTTP 502.
- Successful upstream JSON parsing was present, but empty/non-JSON success bodies were not explicitly normalized.

Repair need:

The source-discovered bridge behavior hid upstream 401/400/404/405/409 statuses behind 502. V2.8.33B repaired that path with public-safe status/code preservation and success response fallback.
