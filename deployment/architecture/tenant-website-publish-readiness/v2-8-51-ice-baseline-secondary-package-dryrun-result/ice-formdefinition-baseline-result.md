# Ice FormDefinition Baseline Result

Target:

- Tenant: `ice-rink-rentals`
- ID: `ice-rink-rentals-default-quote-request`
- Form key: `default-quote-request`
- Name: `Ice Rink Rentals Default Quote Request`
- Status: `active`
- Public-read behavior: active status qualifies for public readback in source.

Source-discovered route:

- `GET /api/admin/forms/{tenantId}/definitions`
- `POST /api/admin/forms/{tenantId}/definitions`
- `PUT /api/admin/forms/{tenantId}/definitions/{formDefinitionId}`
- `GET /api/admin/forms/{tenantId}/definitions/{formDefinitionId}`
- `GET /api/forms/{tenantId}/definitions/{type}`

Result:

- Before readback FormDefinition count: 0.
- Target FormDefinition present before mutation: false.
- Create response: HTTP 201.
- Admin readback response: HTTP 200.
- Public readback response: HTTP 200.
- Field count: 12.
- Hidden field count: 4.
- Runtime submit path: `/api/forms/ice-rink-rentals/entries`.

Only the approved Ice FormDefinition baseline record was created. No form submission or contact POST was performed.

