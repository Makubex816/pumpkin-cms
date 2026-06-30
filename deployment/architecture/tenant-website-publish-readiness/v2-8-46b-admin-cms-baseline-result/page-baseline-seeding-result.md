# Page Baseline Seeding Result

Admin Page route used:

- `POST /api/admin/pages/{tenantId}`

All writes were scoped to `ice-rink-rentals`.

Created records:

| Slug | ID | HTTP | Published | Sitemap | Version |
| --- | --- | ---: | --- | --- | ---: |
| `home` | `ice-rink-rentals-home` | 201 | true | true | 21 |
| `contact` | `ice-rink-rentals-contact` | 201 | true | true | 17 |
| `service-areas` | `ice-rink-rentals-service-areas` | 201 | true | true | 5 |

Final authenticated readback:

- Page count: `3`.
- Published pages: `3`.
- Draft pages: `0`.
- Readback contained `contact@iceskatingrinkrentals.com`.
- Readback did not contain `hello@iceskatingrinkrentals.com`.
