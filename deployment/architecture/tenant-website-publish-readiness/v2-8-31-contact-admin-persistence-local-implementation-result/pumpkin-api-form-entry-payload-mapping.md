# Pumpkin API FormEntry Payload Mapping

The compat payload maps to Pumpkin API `FormEntry` as follows:

- URL: `PUMPKIN_API_URL` + `/api/forms/ice-rink-rentals/entries`
- Method: `POST`
- Auth: `Authorization: Bearer <PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY value>` at runtime only
- `tenantId`: `ice-rink-rentals`
- `siteKey`: `ice-rink-rentals`
- `formId`: `default-quote-request`
- `formKey`: `default-quote-request`
- `sourcePage`: `/contact`
- `leadType`: `quote-request`
- `status`: `new`
- `spamStatus`: `clean`
- `metadata.source`: `static-form-endpoint`
- `metadata.staticEndpointRef`: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- `metadata.leadRecipientRef`: `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- `metadata.tags`: includes `ice-rink-rentals` and `default-quote-request`

The mocked persistence test verified this mapping without writing to Pumpkin API.

When Pumpkin API returns a saved entry `id`, the public compat response uses that returned ID as `entryId`.

