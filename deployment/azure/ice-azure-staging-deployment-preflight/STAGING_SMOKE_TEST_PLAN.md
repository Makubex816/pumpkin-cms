# Staging Smoke Test Plan

Generated: 2026-06-06

## Scope

Run this after a future approved Azure staging deployment. Do not run it during this preflight.

Validate the Azure default hostname first:

```text
https://<ice-swa-default-host>
```

Do not configure or test custom staging DNS until separately approved.

## Route Checks

| URL | Expected |
| --- | --- |
| `/` | 200, Ice homepage |
| `/contact` | 200, contact page |
| `/service-areas` | 200, service areas page |
| `/sitemap.xml` | 200, production canonical sitemap content understood |
| `/robots.txt` | 200, sitemap reference present |
| `/404` or missing route | 404 behavior uses generated `404.html` |
| `/ice-rink-rentals` | not deployable as content route |
| `/events-holiday-activations` | not deployable as content route |
| `/draft-preview/...` | not deployable |

## Page Checks

- CSS and JavaScript assets load without 404s.
- Navigation links work.
- Footer links work.
- No opposite-site branding appears.
- Page source contains no obvious secrets.
- Page source contains no localhost references.
- Page source contains no `CMS LIVE` marker.
- Page source contains no local `/media/ice-rink-rentals/...` strings.
- Page source contains no `latestSnapshot`.
- No unintended `noindex` meta appears on content pages.
- Canonical URLs are production-domain canonical URLs and are understood before sharing staging widely.
- Mobile/responsive spot check passes for `/`, `/contact`, and `/service-areas`.

## Media Checks

- Hero images load.
- Card/media grid images load.
- Logo and partner logo images load where rendered.
- Image URLs use `media.iceskatingrinkrentals.com`.
- Sample media requests return `200`.
- Cache header for immutable media is understood.

## Contact Form Checks

No automatic valid email test is approved.

Required safe checks:

- Contact form UI loads on `/contact`.
- Any homepage form UI loads if present.
- The static endpoint URL is present only as the approved public URL.
- Run safe `OPTIONS` check against `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact`.
- If using the Azure default hostname as the `Origin`, record whether CORS allows it.
- If the default hostname is not allowed, stop and request separate Function setting approval. Do not send a valid payload.

Optional later checks only with explicit approval:

- valid staging form payload
- inbox/FormEntry verification
- live email delivery test

## SEO/Staging Caution

- Do not submit staging sitemaps to search engines.
- Do not add production root/www DNS.
- Do not share staging broadly until canonical/noindex behavior is reviewed.

## Evidence To Record

- Azure default hostname
- deployed artifact path or run ID
- commit SHA
- validator results
- route HTTP statuses
- media sample statuses
- form `OPTIONS` result
- screenshots or notes for responsive spot checks
- all failures and whether they are package, hosting, form-origin, or content warnings
