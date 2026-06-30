# Admin UI Pages Proof

Production Admin UI GET checks:

- `/dashboard/pages`: HTTP 200.

Authenticated API truth used by the Admin pages client:

- `GET /api/admin/pages?tenantId=ice-rink-rentals`: HTTP 200.
- Count: `3`.

Readback slugs:

- `home`
- `contact`
- `service-areas`

All three records are published and included in sitemap.
