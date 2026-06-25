# Route Source Integration Result

Result: integrated.

Route source wiring:

- `apps/ice-rink-web/src/data/fallback-home.ts` now returns `getIceRinkRecoveredHome(site)` for `site.key === 'ice-rink-rentals'`.
- `apps/ice-rink-web/src/data/fallback-pages.ts` now returns `getIceRinkRecoveredPage(site, normalizedSlug)` for `site.key === 'ice-rink-rentals'`.
- `apps/ice-rink-web/src/data/ice-rink-recovered-pages.ts` dispatches:
  - empty slug, `/`, and `home` to the recovered homepage.
  - `service-areas` to the recovered service-area page.
  - `contact` to the recovered contact page.

Other tenant fallback behavior remains on the existing generic fallback path.
