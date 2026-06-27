# Admin Persistence Requirement

Admin persistence means:

An accepted public/static contact submission must result in a Pumpkin `FormEntry` object stored in the tenant-scoped provider that Pumpkin API uses for Admin reads.

For this tenant:

- Tenant ID: `ice-rink-rentals`.
- Form ID/Form key: `default-quote-request`.
- Lead type: `quote-request`.
- Expected Admin read endpoint: `/api/admin/ice-rink-rentals/form-entries`.

Gate closure proof:

- A no-PII test submission is accepted.
- The returned entry ID is the exact entry read back through the Admin `FormEntry` path.
- The operator/Admin view sees that exact record.

Non-proof:

- A generated ID alone.
- A `200 ok:true` response alone.
- Graph/email acceptance alone.
- Provider inbox visibility without a matching Admin `FormEntry`.
