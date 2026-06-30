# Ice Theme Baseline Result

Target:

- Tenant: `ice-rink-rentals`
- Theme ID: `ice-rink-rentals-default-theme`
- Name: `Ice Rink Rentals Default Theme`
- Active: true

Source-discovered route:

- `GET /api/admin/themes/{tenantId}`
- `POST /api/admin/themes/{tenantId}`
- `PUT /api/admin/themes/{tenantId}/{themeId}`
- `GET /api/admin/themes/{tenantId}/{themeId}`

Result:

- Before readback Theme count: 0.
- Target Theme present before mutation: false.
- Create response: HTTP 201.
- Readback response: HTTP 200.
- Readback active flag: true.
- Readback menu count: 3.

Only the approved Ice Theme baseline record was created. No other tenant Theme mutation was performed.

