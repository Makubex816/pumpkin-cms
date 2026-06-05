# Direct Azure Blob Public URL Validation

## Summary

Direct anonymous Azure Blob public URL validation passed after Phase 1B.

Result:

```text
publicly readable: 9/9
status for all 9 direct URLs: 200 OK
content type for all 9 direct URLs: image/png
cache-control for all 9 direct URLs: public, max-age=31536000, immutable
```

Representative post-change response:

```text
HTTP/1.1 200 OK
Content-Type: image/png
Cache-Control: public, max-age=31536000, immutable
```

No SAS URLs were generated or used.

## Validation Table

| # | Asset ID | HTTP status | Content type | Content length | Cache-control | Publicly readable |
| ---: | --- | --- | --- | ---: | --- | --- |
| 1 | `winterfesticerinkrentals-324b1b89777d` | 200 OK | `image/png` | 3607110 | `public, max-age=31536000, immutable` | yes |
| 2 | `corporateicerinkrentalevent-18e985ca59bd` | 200 OK | `image/png` | 3685341 | `public, max-age=31536000, immutable` | yes |
| 3 | `holidayicerink-973ce7691377` | 200 OK | `image/png` | 3866376 | `public, max-age=31536000, immutable` | yes |
| 4 | `icerinkrentalssetup-113d218572e4` | 200 OK | `image/png` | 3545952 | `public, max-age=31536000, immutable` | yes |
| 5 | `iceskatingrinkrentalslogo-0d1f970f0411` | 200 OK | `image/png` | 1627660 | `public, max-age=31536000, immutable` | yes |
| 6 | `partyproseastcoastlogo-cfd1fc9f60ae` | 200 OK | `image/png` | 24434 | `public, max-age=31536000, immutable` | yes |
| 7 | `chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | 200 OK | `image/png` | 1923827 | `public, max-age=31536000, immutable` | yes |
| 8 | `chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | 200 OK | `image/png` | 2253456 | `public, max-age=31536000, immutable` | yes |
| 9 | `chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | 200 OK | `image/png` | 2105292 | `public, max-age=31536000, immutable` | yes |

