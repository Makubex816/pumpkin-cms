# Public API Readiness Proof

Result: partially ready; exact public page blocker documented.

Source-supported public/read-only routes:

- `GET /api/forms/{tenantId}/definitions/{type}`.
- `GET /api/themes/{tenantId}`.
- `GET /api/tenant/{tenantId}/sitemap`.
- `GET /api/pages/{tenantId}/{pageSlug}` for published pages.

Live public read results for Airstrip:

- FormDefinition `airstrip-reservation`: HTTP 200.
- Themes: HTTP 200.
- Sitemap: HTTP 200.
- Public page reads: HTTP 404 for all 5 slugs.

Public page read statuses:

| Slug | Status |
| --- | --- |
| `contact` | HTTP 404 |
| `home` | HTTP 404 |
| `packages` | HTTP 404 |
| `request-booking` | HTTP 404 |
| `service-areas` | HTTP 404 |

Root cause classification:

`public_page_api_blocked_by_unpublished_airstrip_pages`.

Source requires public page reads to find pages where `isPublished=true`. Airstrip currently has 5 pages with `isPublished:false`, `includeInSitemap:false`, and `staticPublishing.needsRebuild:true`.

No page publish, rebuild, deployment, form submission, or contact POST occurred.
