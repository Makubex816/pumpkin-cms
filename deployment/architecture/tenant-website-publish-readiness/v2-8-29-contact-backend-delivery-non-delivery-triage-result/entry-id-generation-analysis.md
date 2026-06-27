# Entry ID Generation Analysis

Source inspected:

- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs`

Finding:

The compat API generates the entry ID locally when it builds the entry object:

- `id: ${site.tenantId}-${formId}-${randomUUID()}` in `buildFormEntry`: `contact-handler.mjs:135-136`.

The V2.8.26 entry ID:

`ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`

matches that pattern:

- tenant/site prefix: `ice-rink-rentals`
- form ID/key: `default-quote-request`
- UUID suffix: `f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`

The ID is therefore a generated response identifier first. It becomes a persisted `FormEntry.id` only if the delivery path writes the entry to Pumpkin API and the backing store accepts it.

