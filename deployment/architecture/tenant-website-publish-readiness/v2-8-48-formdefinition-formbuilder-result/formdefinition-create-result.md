# FormDefinition Create Result

Synthetic proof:

- Trace ID: `V2.8.48-3e4b1897b1ca4375912f5d469b743276`
- Tenant: `ice-rink-rentals`
- Synthetic FormDefinition ID: `v2-8-48-proof-form`
- Form type: `v2-8-48-proof`

Preflight:

- Admin login: HTTP `200`; token was not printed or written.
- Admin list: HTTP `200`.
- Previous synthetic count: `0`.

Create:

- Endpoint: `POST /api/admin/forms/ice-rink-rentals/definitions`
- Result: HTTP `201`.
- Created ID matched the synthetic ID.

No FormEntry submission was sent.
