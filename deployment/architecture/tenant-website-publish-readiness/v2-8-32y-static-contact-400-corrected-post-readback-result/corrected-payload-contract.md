# Corrected Payload Contract

Corrected request headers:

- `Origin: https://iceskatingrinkrentals.com`
- `Referer: https://iceskatingrinkrentals.com/contact`
- `Content-Type: application/json`

Corrected top-level payload fields:

- `siteKey`: `ice-rink-rentals`
- `tenantId`: `ice-rink-rentals`
- `formId`: `default-quote-request`
- `formKey`: `default-quote-request`
- `pageSlug`: `contact`
- `sourcePage`: `/contact`
- `formType`: `quote-request`
- `staticEndpointRef`: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- `leadRecipientRef`: `ICE_RINK_RENTALS_LEAD_RECIPIENT`

Corrected form data:

- Non-PII QA name.
- Public expected email.
- Synthetic phone.
- Synthetic event location fields.
- Synthetic event date/type/venue/attendance fields.
- Message containing the V2.8.32Y trace ID.
- `consent`: `true`.
- Honeypot blank.

Trace:

`v2-8-32y-production-contact-admin-persistence-20260628190636-c96a10c5`
