# Runtime No-Regression Proof

The post-deploy sweep used GET only and intentionally omitted Airstrip.

Result: 24/24 routes returned HTTP 200 with zero HTML POST-method markers.

Coverage:

- Ice apex and `www`: `/`, `/contact`, `/service-areas`;
- Ice apex and `www`: `/api/static-contact-health`;
- Pumpkin API: `/health`, `/api/health`;
- standalone Admin UI: `/`, `/login`, `/dashboard`, `/dashboard/forms`;
- starter default host: `/`;
- Party Pros apex and `www`: `/`, `/contact`, `/service-areas`;
- Party Pros preview: home, contact, and service areas.

Airstrip route count: 0. Ice mutation count: 0. Contact/form POST count: 0.
