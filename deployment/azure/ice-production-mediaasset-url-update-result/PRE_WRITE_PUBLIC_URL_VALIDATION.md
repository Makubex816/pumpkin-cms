# Pre-Write Public URL Validation

Date: 2026-06-05

## Result

All 9 approved production media URLs passed live `HEAD` and `GET` checks before any MediaAsset write.

```text
checked: 9
passed: 9
HEAD 200: 9
GET 200: 9
content type image/png: 9
expected content length and downloaded byte length matched: 9
cache-control public, max-age=31536000, immutable: 9
redirects to Azure host: 0
query/SAS secret indicators: 0
```

## Detail

| # | MediaAsset ID | Status | Content type | Length | Cache-control | Redirect |
| ---: | --- | --- | --- | ---: | --- | --- |
| 1 | `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` | HEAD 200 / GET 200 | `image/png` | 3607110 | `public, max-age=31536000, immutable` | none |
| 2 | `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` | HEAD 200 / GET 200 | `image/png` | 3685341 | `public, max-age=31536000, immutable` | none |
| 3 | `ice-rink-rentals-holidayicerink-973ce7691377` | HEAD 200 / GET 200 | `image/png` | 3866376 | `public, max-age=31536000, immutable` | none |
| 4 | `ice-rink-rentals-icerinkrentalssetup-113d218572e4` | HEAD 200 / GET 200 | `image/png` | 3545952 | `public, max-age=31536000, immutable` | none |
| 5 | `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` | HEAD 200 / GET 200 | `image/png` | 1627660 | `public, max-age=31536000, immutable` | none |
| 6 | `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` | HEAD 200 / GET 200 | `image/png` | 24434 | `public, max-age=31536000, immutable` | none |
| 7 | `ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | HEAD 200 / GET 200 | `image/png` | 1923827 | `public, max-age=31536000, immutable` | none |
| 8 | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | HEAD 200 / GET 200 | `image/png` | 2253456 | `public, max-age=31536000, immutable` | none |
| 9 | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | HEAD 200 / GET 200 | `image/png` | 2105292 | `public, max-age=31536000, immutable` | none |

No Azure keys, connection strings, SAS URLs, or query secrets were used or printed.
