# Pumpkin FormEntry Write Path Analysis

Existing public/static-compatible write path:

- `apps/pumpkin-api/Program.cs:251-270` maps `POST /api/forms/{tenantId}/entries`.
- The endpoint extracts an API key from the Bearer authorization header.
- The endpoint calls `PumpkinManager.SaveFormEntryAsync`.
- `apps/pumpkin-api/Managers/PumpkinManager.cs:178-207` requires API key, tenant ID, a form entry payload, a valid `FormSubmissionGuard` result, and a form ID.
- The manager delegates to `databaseService.SaveFormEntryAsync`.

Provider persistence:

- Cosmos implementation writes to the `FormEntry` container with tenant partitioning.
- Mongo implementation writes to the `FormEntry` collection and sorts tenant reads by submitted time.
- Admin reads use the same `GetFormEntriesByTenantAsync`/`GetFormEntryAsync` service contract.

Compat endpoint forwarding:

- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs:173-185` dispatches based on delivery mode.
- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs:188-198` resolves `FORM_DELIVERY_MODE` or legacy `STATIC_FORM_FORWARD_MODE`.
- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs:205-227` posts the built entry to Pumpkin API using `PUMPKIN_API_URL` and the site-specific API key env var.

Answer:

Yes, a Pumpkin API form-entry write endpoint already exists. It is not anonymous; it requires the tenant API key. The static compat function can call it server-side when `FORM_DELIVERY_MODE=pumpkin-api` and the required protected bindings exist.
