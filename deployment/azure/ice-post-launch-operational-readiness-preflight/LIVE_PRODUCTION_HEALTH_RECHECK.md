# Live Production Health Recheck

Generated: 2026-06-06

## Approved Routes

| URL | Status | Final URL | Canonical | Robots | Noindex | Hidden blocker hits | Tracking hits |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `https://iceskatingrinkrentals.com/` | 200 | `https://iceskatingrinkrentals.com/` | `https://iceskatingrinkrentals.com/` | `index,follow` | no | 0 | 0 |
| `https://iceskatingrinkrentals.com/contact/` | 200 | `https://iceskatingrinkrentals.com/contact/` | `https://iceskatingrinkrentals.com/contact/` | `index,follow` | no | 0 | 0 |
| `https://iceskatingrinkrentals.com/service-areas/` | 200 | `https://iceskatingrinkrentals.com/service-areas/` | `https://iceskatingrinkrentals.com/service-areas/` | `index,follow` | no | 0 | 0 |
| `https://www.iceskatingrinkrentals.com/` | 200 | `https://www.iceskatingrinkrentals.com/` | `https://iceskatingrinkrentals.com/` | `index,follow` | no | 0 | 0 |
| `https://www.iceskatingrinkrentals.com/contact/` | 200 | `https://www.iceskatingrinkrentals.com/contact/` | `https://iceskatingrinkrentals.com/contact/` | `index,follow` | no | 0 | 0 |
| `https://www.iceskatingrinkrentals.com/service-areas/` | 200 | `https://www.iceskatingrinkrentals.com/service-areas/` | `https://iceskatingrinkrentals.com/service-areas/` | `index,follow` | no | 0 | 0 |

Hidden blocker scan covered:

- `Static generation and production indexing are not authorized`
- `needs_review`
- `schemaWarnings`
- `pageQuality`
- `usageStatus`

Tracking scan covered common GA/GTM/pixel markers:

- `gtag`
- `googletagmanager`
- `Google Analytics`
- `GTM-`
- `dataLayer`
- `fbq(`
- `Meta Pixel`

## Sitemap and Robots

| URL | Status | Final URL | Result |
| --- | --- | --- | --- |
| `https://iceskatingrinkrentals.com/sitemap.xml` | 200 | `https://iceskatingrinkrentals.com/sitemap.xml` | lists approved canonical URLs only |
| `https://iceskatingrinkrentals.com/robots.txt` | 200 | `https://iceskatingrinkrentals.com/robots.txt` | allows indexing and references production sitemap |

Sitemap URLs:

- `https://iceskatingrinkrentals.com/contact/`
- `https://iceskatingrinkrentals.com/`
- `https://iceskatingrinkrentals.com/service-areas/`

Robots content:

```text
User-agent: *
Allow: /

Sitemap: https://iceskatingrinkrentals.com/sitemap.xml
```

## Media Check

| Check | Result |
| --- | --- |
| URL | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/winterfesticerinkrentals-324b1b89777d/324b1b89777d8f9d277f4cee70390eb0a3f68dd6902457f9f6f19164e1fbb59c/winterfesticerinkrentals-324b1b89777d.png` |
| method | HEAD |
| status | 200 |
| content type | `image/png` |
| content length | `3607110` |

## Form OPTIONS Checks

No form POST was sent.

| Origin | Status | Allow-Origin | Allow-Methods | Allow-Headers |
| --- | --- | --- | --- | --- |
| `https://iceskatingrinkrentals.com` | 204 | `https://iceskatingrinkrentals.com` | `OPTIONS, POST` | `Content-Type` |
| `https://www.iceskatingrinkrentals.com` | 204 | `https://www.iceskatingrinkrentals.com` | `OPTIONS, POST` | `Content-Type` |

## Obsolete and Preview Route Checks

The checked obsolete, preview, and arbitrary missing routes returned 404 on apex and `www`:

- `/ice-rink-rentals`
- `/events-holiday-activations`
- `/draft-preview`
- `/draft-preview/ice-rink-rentals`
- `/phase-5a-csv-import-54754949`
- `/api/preview`
- `/preview`
- `/__ice-post-launch-missing-route`

## Public DNS View

| Name | Public result |
| --- | --- |
| `iceskatingrinkrentals.com` A | `132.220.38.112` |
| `www.iceskatingrinkrentals.com` CNAME | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| `happy-mud-0b375e20f.7.azurestaticapps.net` | CNAME chain to Azure Static Web Apps edge |
| `media.iceskatingrinkrentals.com` A/AAAA | Cloudflare edge IPs |
| root MX | `iceskatingrinkrentals-com.mail.protection.outlook.com` |

## Read-Only Provider Summary

Credential values, IDs, tokens, and settings values were not printed.

| Provider area | Result |
| --- | --- |
| Azure Static Web App | read OK; `swa-ice-static-staging`, `East US 2`, Free SKU, default hostname `happy-mud-0b375e20f.7.azurestaticapps.net`, provider `SwaCli` |
| Azure Function App | read OK; `func-ice-static-contact-20260605`, state `Running`, HTTPS-only |
| Cloudflare media DNS | read OK; one proxied `media.iceskatingrinkrentals.com` CNAME present |
| Cloudflare media Worker route | read OK; `media.iceskatingrinkrentals.com/ice-rink-rentals/assets/*` routes to `ice-media-delivery` |

## Classification

Live production health: pass.
