# Content Hierarchy Read Result

Routes:

- `GET /api/admin/tenants/ice-rink-rentals/hubs`
- `GET /api/admin/tenants/ice-rink-rentals/content-hierarchy`

Result while the proof page existed:

- Hubs status: HTTP 200.
- Hub count: 0.
- Content hierarchy status: HTTP 200.
- Content hierarchy total pages: 1.
- Proof slug present in hierarchy response body: true.

The synthetic proof page was not a hub. It appeared as tenant-scoped page content during the proof window.
