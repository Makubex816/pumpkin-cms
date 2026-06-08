# Preflight Scope

Phase 2C-5 defines the operator controls needed before a future Roller Rink Rentals CMS import can be considered.

## Approved Now

- Create no-write documentation for a future CMS read-only preflight.
- Define environment-variable presence checks without printing values.
- Define future command structures with placeholders only.
- Define read-only and write boundaries.
- Define go/no-go criteria.
- Define rollback capture requirements.
- Define post-import readback verification requirements.
- Define final approval wording for a later CMS import execution.

## Not Approved Now

- Running CMS read-only checks.
- Running CMS write commands.
- Creating a real Roller tenant.
- Importing pages, routes, forms, SEO, theme, redirects, or media records.
- Writing MediaAsset records or binary media.
- Triggering static generation, deployment, production readiness, or live pages.
- Touching Azure, Cloudflare, DNS, email, Microsoft 365, Search Console, indexing, Function App settings, or external HTTP checks.

## Candidate Tenant

| Field | Value |
| --- | --- |
| Tenant display name | Roller Rink Rentals |
| Primary domain | rollerrinkrentals.com |
| WWW domain | www.rollerrinkrentals.com |
| Media domain | media.rollerrinkrentals.com |
| Approved routes | `/`, `/contact`, `/service-areas` |
| Forbidden routes | `/preview`, `/draft`, `/old-roller-rink-rentals` |
| Deployment profile | `static-azure-cloudflare-worker-graph` |
| Form recipient ref | `roller-rink-leads` |

## Preflight Output Target

A later read-only preflight should write a redacted evidence package only. It should include command transcript summaries, presence-only env status, package validation output, CMS conflict findings, and an operator go/no-go decision.
