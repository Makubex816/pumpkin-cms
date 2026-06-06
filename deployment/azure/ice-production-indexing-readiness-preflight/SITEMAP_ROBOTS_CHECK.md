# Sitemap and Robots Check

Generated: 2026-06-06

## Sitemap

| URL | Status | Content Type | Result |
| --- | --- | --- | --- |
| `https://iceskatingrinkrentals.com/sitemap.xml` | 200 | `text/xml` | pass with slash-alignment note |
| `https://www.iceskatingrinkrentals.com/sitemap.xml` | 200 | `text/xml` | pass with slash-alignment note |

Sitemap locations:

```text
https://iceskatingrinkrentals.com/contact
https://iceskatingrinkrentals.com
https://iceskatingrinkrentals.com/service-areas
```

Sitemap checks:

| Check | Result |
| --- | --- |
| lists only approved production pages | yes |
| apex production host only | yes |
| `www` URLs absent | yes |
| staging/default-host URLs absent | yes |
| localhost URLs absent | yes |
| obsolete URLs absent | yes |
| trailing slash alignment with canonicals | needs cleanup or acceptance |

## Robots.txt

| URL | Status | Content Type | Result |
| --- | --- | --- | --- |
| `https://iceskatingrinkrentals.com/robots.txt` | 200 | `text/plain` | pass |
| `https://www.iceskatingrinkrentals.com/robots.txt` | 200 | `text/plain` | pass |

Robots content:

```text
User-agent: *
Allow: /

Sitemap: https://iceskatingrinkrentals.com/sitemap.xml
```

Robots checks:

| Check | Result |
| --- | --- |
| global disallow absent | yes |
| indexing permitted | yes |
| production sitemap referenced | yes |
| staging/default-host URLs absent | yes |
| localhost URLs absent | yes |

## Result

Robots is indexing-ready. Sitemap is production-only and route-ready, with a pre-submission cleanup recommendation to align sitemap locations with canonical trailing slashes.
