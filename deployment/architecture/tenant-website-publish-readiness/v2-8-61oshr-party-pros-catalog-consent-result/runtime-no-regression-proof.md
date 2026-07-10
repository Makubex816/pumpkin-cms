# Runtime No-Regression Proof

Post-deploy GET-only result: 33/33 routes returned HTTP 200. HTML POST-method markers: 0.

Coverage:

- Ice apex and `www`: `/`, `/contact`, `/service-areas`, `/api/static-contact-health`;
- Pumpkin API: `/health`, `/api/health`;
- standalone Admin UI: `/`, `/login`, `/dashboard`, `/dashboard/forms`;
- starter default host: `/`;
- Party Pros apex and `www`: `/`, `/contact`, `/service-areas`, `/catalog`, `/carnival-games`, `/dunk-tank-rentals-philadelphia`;
- Party Pros explicit preview: home, contact, service areas, catalog, representative category, representative item.

Airstrip routes checked: 0. Ice mutations: 0. Form/contact POSTs during no-regression: 0.

