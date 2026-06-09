# Page, Route, And Sitemap Result

## Route Matrix

| Route/page | Admin read | Public read | Admin list | Sitemap text | Reconciliation posture |
| --- | --- | --- | --- | --- | --- |
| `home` / `/` | 200 | 200 | present | present | adopt/update only with approval |
| `contact` / `/contact/` | 200 | 200 | present | present | adopt/update only with approval |
| `service-areas` / `/service-areas/` | 404 | 404 | absent | absent | create only under later CMS write approval |
| `roller-rink-rentals` / `/roller-rink-rentals/` | 200 | 200 | present | present | preserve pending owner decision |
| `old-roller-rink-rentals` | 404 | not part of public refresh | absent | absent | no current admin conflict found |
| `preview` | 404 | not part of public refresh | absent | absent | no current admin conflict found |
| `draft` | 404 | not part of public refresh | no slug endpoint found | absent | duplicate draft page remains separate |

## Sitemap Evidence

The public sitemap endpoint returned 200 with 3 entries. The sitemap text matched the existing public/published routes:

- `home`
- `contact`
- `roller-rink-rentals`

The required `service-areas` route was not found in the sitemap evidence.

## Duplicate/Draft Evidence

The tenant page list still includes `roller-phase-3-duplicate-test-51412237` as unpublished and not sitemap-included. It should remain untouched unless a later cleanup-specific approval covers it.

## Page Decision Summary

- Preserve existing public pages until an owner-approved reconciliation plan specifies exact field/page changes.
- Do not overwrite `home`, `contact`, or `roller-rink-rentals` by slug alone.
- Treat `service-areas` as a missing expected page that needs a future scoped create/import write plan.
- Keep sitemap and publication flags unchanged until a later explicit SEO/sitemap/live-page gate.
