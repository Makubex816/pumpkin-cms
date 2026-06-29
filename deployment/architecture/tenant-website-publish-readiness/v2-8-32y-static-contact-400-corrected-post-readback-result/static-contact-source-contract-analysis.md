# Static Contact Source Contract Analysis

Source inspected:

- `deployment/static-azure/forms/static-form-endpoint-compat/validate-static-form-payload.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs`
- `apps/ice-rink-web/src/data/ice-rink-recovered-pages.ts`
- `apps/ice-rink-web/src/lib/public-render-page.ts`
- `apps/ice-rink-web/src/components/PageRenderer.tsx`

Source-required request contract:

- Method: `POST`.
- Content type: JSON.
- Origin must be allowlisted unless missing origin is explicitly allowed.
- Site resolves as `ice-rink-rentals`.
- Tenant resolves as `ice-rink-rentals`.
- `formId`: `default-quote-request`.
- `formKey`: `default-quote-request`.
- `staticEndpointRef`: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`.
- `leadRecipientRef`: `ICE_RINK_RENTALS_LEAD_RECIPIENT`.
- Required form data includes name, valid email, consent, and for quote requests phone plus event location or message.
- Honeypot fields must remain blank.

Handler result mapping:

- Validation failure returns HTTP 400.
- Delivery failure after validation returns HTTP 502.
- Successful delivery returns HTTP 200 with an `entryId`.
