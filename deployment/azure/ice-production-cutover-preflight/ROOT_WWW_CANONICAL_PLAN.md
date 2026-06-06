# Root And WWW Canonical Plan

Generated: 2026-06-06

## Canonical Preference

Canonical host:

```text
iceskatingrinkrentals.com
```

Reasons:

- deployed pages already emit apex canonical URLs
- `sitemap.xml` uses apex URLs
- `robots.txt` points to the apex sitemap
- production form CORS already allows both apex and `www`

## Current Static Output

Observed staging default-host canonicals:

| Route | Canonical |
| --- | --- |
| `/` | `https://iceskatingrinkrentals.com/` |
| `/contact` | `https://iceskatingrinkrentals.com/contact/` |
| `/service-areas` | `https://iceskatingrinkrentals.com/service-areas/` |

`redirects.json` currently has:

```text
redirectCount: 0
```

Obsolete routes return 404 on staging rather than redirecting.

## WWW Plan

Preferred future state:

```text
www.iceskatingrinkrentals.com -> 301 -> iceskatingrinkrentals.com
```

Implementation should be a separate approved Cloudflare redirect rule or equivalent host-level redirect. Azure Static Web Apps route config is not currently deployed with a host-based `www` redirect.

If redirect approval is deferred, bind and serve both root and `www` temporarily, with root canonical tags preventing the worst duplicate-content signal.

## Indexing

Do not submit production sitemap or update indexing status until:

- root serves approved routes
- `www` behavior is accepted
- sitemap and robots are live on the intended host
- approved pages have no noindex
- obsolete/preview routes are absent or 404
