# Post-Change Public URL Validation

Date: 2026-06-05

## DNS and Routing

`media.iceskatingrinkrentals.com` resolves through Cloudflare.

The configured Worker route is:

```text
media.iceskatingrinkrentals.com/ice-rink-rentals/assets/*
```

## HTTPS Validation Summary

All 9 locked public media URLs passed.

```text
checked: 9
HTTP 200 OK: 9
content type image/png: 9
content length matched expected: 9
cache-control public, max-age=31536000, immutable: 9
redirects to wrong host: 0
Azure keys, SAS URLs, or query secrets exposed: 0
```

## Validation Details

| # | MediaAsset ID | Status | Content type | Content length | Expected length | Cache-control | Redirect |
| ---: | --- | ---: | --- | ---: | ---: | --- | --- |
| 1 | `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` | 200 | `image/png` | 3607110 | 3607110 | `public, max-age=31536000, immutable` | none |
| 2 | `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` | 200 | `image/png` | 3685341 | 3685341 | `public, max-age=31536000, immutable` | none |
| 3 | `ice-rink-rentals-holidayicerink-973ce7691377` | 200 | `image/png` | 3866376 | 3866376 | `public, max-age=31536000, immutable` | none |
| 4 | `ice-rink-rentals-icerinkrentalssetup-113d218572e4` | 200 | `image/png` | 3545952 | 3545952 | `public, max-age=31536000, immutable` | none |
| 5 | `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` | 200 | `image/png` | 1627660 | 1627660 | `public, max-age=31536000, immutable` | none |
| 6 | `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` | 200 | `image/png` | 24434 | 24434 | `public, max-age=31536000, immutable` | none |
| 7 | `ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | 200 | `image/png` | 1923827 | 1923827 | `public, max-age=31536000, immutable` | none |
| 8 | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | 200 | `image/png` | 2253456 | 2253456 | `public, max-age=31536000, immutable` | none |
| 9 | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | 200 | `image/png` | 2105292 | 2105292 | `public, max-age=31536000, immutable` | none |

## Result

Cloudflare public media URL validation passed for the approved 9 URLs.

Media production URL readiness is still not complete because MediaAsset production URL updates and strict validators were not approved or run in this scope.
