# Contact Admin Persistence Implementation Result

Implemented locally in the compat Azure Functions v3 package:

- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/validate-static-form-payload.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs`

Implementation result:

- `FORM_DELIVERY_MODE=pumpkin-api` forwards to Pumpkin API with mocked fetch in local tests.
- `PUMPKIN_API_URL` is now required in `pumpkin-api` mode; there is no localhost fallback for a claimed persistence write.
- `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME` can select the protected app-setting name, and the selected name must match a safe env-var-name pattern.
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE` or `PUMPKIN_API_WRITE_ROUTE`, when configured, must match `/api/forms/{tenantId}/entries`.
- Missing base URL or missing protected API key fails with 502 before fetch is called and before an accepted entry ID is returned.
- Ice form submissions are constrained to `default-quote-request` before persistence.

The implementation did not read real protected config, did not submit a contact POST, and did not deploy.

