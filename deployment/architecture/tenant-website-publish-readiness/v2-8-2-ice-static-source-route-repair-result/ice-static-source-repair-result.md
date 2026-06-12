# Ice Static Source Repair Result

## Files Repaired

| Path | Change |
| --- | --- |
| `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/service-areas.json` | added safe local `/service-areas` page |
| `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/ice-rink-rentals.json` | removed obsolete Ice seed route |
| `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/events-holiday-activations.json` | removed obsolete Ice seed route |
| `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/theme.json` | updated menu to `/`, `/service-areas`, `/contact` |
| `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/home.json` | updated internal links away from obsolete routes |
| `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/contact.json` | updated internal link away from obsolete route |
| `tools/ice-rink-local-seed/scripts/validate-seed.mjs` | updated Ice expected slugs to `home`, `contact`, `service-areas` |
| `tools/ice-rink-local-seed/README.md` | updated local route docs |

The new `service-areas.json` uses safe local proof content, no media URLs, no protected config, no secrets, no external calls, and no unsupported city-page claims.

No CMS write or provider write occurred.
