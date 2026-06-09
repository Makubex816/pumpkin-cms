# CMS Content Export Result

Date: 2026-06-09

CMS content export was included using read-only admin GET requests only.

## Read-Only Requests

| Label | Endpoint | Method | Status |
| --- | --- | --- | ---: |
| Admin tenant | `/api/admin/tenants/ice-rink-rentals` | GET | 200 |
| Admin pages | `/api/admin/pages?tenantId=ice-rink-rentals` | GET | 200 |
| Admin themes | `/api/admin/themes/ice-rink-rentals` | GET | 200 |
| Admin active theme | `/api/admin/themes/ice-rink-rentals/active` | GET | 200 |
| Admin media assets | `/api/admin/ice-rink-rentals/media-assets` | GET | 200 |

## Bundle Files

- `cms-content/tenants.json`
- `cms-content/sites.json`
- `cms-content/pages.json`
- `cms-content/routes.json`
- `cms-content/forms.json`
- `cms-content/seo.json`
- `cms-content/redirects.json`
- `cms-content/theme.json`

## Counts

| Inventory | Count |
| --- | ---: |
| Tenants | 1 |
| Sites | 1 |
| Pages | 3 |
| Routes | 5 |
| Forms | 3 |
| SEO entries | 3 |
| Redirects | 0 |
| Theme settings | 1 |

## Exclusions

- Form submissions/leads were not exported.
- No POST, PUT, PATCH, or DELETE request was made.
- No CMS tenant, page, route, form, theme, or media record was created or modified.

## Notes

The CMS export intentionally includes only the approved Ice standard backup route set. The bundle warning records excluded non-approved page slugs so they can be reviewed separately before any future reconciliation or publishing decision.

