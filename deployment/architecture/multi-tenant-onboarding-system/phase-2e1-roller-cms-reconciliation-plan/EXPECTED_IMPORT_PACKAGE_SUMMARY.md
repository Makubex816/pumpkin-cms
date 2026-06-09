# Expected Import Package Summary

## Local Validation Result

The Roller local package revalidated successfully:

| Check | Result |
| --- | --- |
| Builder tests | passed, 41 tests |
| Builder check | passed |
| Validator tests | passed, 18 tests |
| Validator check | passed |
| Roller dry-run | passed, 0 files written |
| Generate/validate/support | passed |
| Validation errors | 0 |
| Validation warnings | 0 |
| Support packet redaction | passed |

Generated output remains ignored under `.tmp` and was not read or staged in this phase.

## Candidate Identity

| Field | Expected package value |
| --- | --- |
| Tenant display name | `Roller Rink Rentals` |
| Tenant/site key | `roller-rink-rentals` |
| Primary domain | `rollerrinkrentals.com` |
| WWW domain | `www.rollerrinkrentals.com` |
| Media domain | `media.rollerrinkrentals.com` |
| Deployment profile | `static-azure-cloudflare-worker-graph` |

## Expected Entities

| Entity | Expected package shape |
| --- | --- |
| Tenant | Roller tenant identity shell |
| Site/domain | primary, www, media domains; no DNS/deployment authorization |
| Routes | `/`, `/contact/`, `/service-areas/` |
| Forbidden routes | `/preview/`, `/draft/`, `/old-roller-rink-rentals/`, `/old/` |
| Pages | `home`, `contact`, `service-areas` |
| Form | `contact-form` |
| Form delivery | `no-email` |
| Lead recipient reference | `roller-rink-leads` |
| Media reference | `hero-roller-rink` |
| SEO | `noindex,nofollow`; sitemap disabled until final gate |
| Theme | draft/navigation/settings mapping |
| Redirects | none in current local package |

## Package Hard Stops

- Live pages are not approved.
- Search Console and indexing are not approved.
- Email delivery is not approved.
- DNS, Cloudflare, Azure, deployment, and Function App settings are not approved.
