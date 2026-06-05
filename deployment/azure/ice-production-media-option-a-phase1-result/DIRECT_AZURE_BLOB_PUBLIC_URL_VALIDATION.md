# Direct Azure Blob Public URL Validation

## Summary

Direct anonymous Azure Blob public URL validation did not pass because the container remains private.

Result:

```text
publicly readable: 0/9
status for all 9 direct URLs: 404
```

Representative post-change response:

```text
HTTP/1.1 404 The specified resource does not exist.
```

The blobs still exist according to authenticated read-only Blob list checks. The anonymous response is consistent with account-level public access being enabled while container public access remains unset.

## Validation Table

| # | Asset ID | HTTP status | Content type | Content length | Cache-control | Publicly readable |
| ---: | --- | ---: | --- | --- | --- | --- |
| 1 | `winterfesticerinkrentals-324b1b89777d` | 404 | unavailable | unavailable | unavailable | no |
| 2 | `corporateicerinkrentalevent-18e985ca59bd` | 404 | unavailable | unavailable | unavailable | no |
| 3 | `holidayicerink-973ce7691377` | 404 | unavailable | unavailable | unavailable | no |
| 4 | `icerinkrentalssetup-113d218572e4` | 404 | unavailable | unavailable | unavailable | no |
| 5 | `iceskatingrinkrentalslogo-0d1f970f0411` | 404 | unavailable | unavailable | unavailable | no |
| 6 | `partyproseastcoastlogo-cfd1fc9f60ae` | 404 | unavailable | unavailable | unavailable | no |
| 7 | `chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | 404 | unavailable | unavailable | unavailable | no |
| 8 | `chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | 404 | unavailable | unavailable | unavailable | no |
| 9 | `chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | 404 | unavailable | unavailable | unavailable | no |

No SAS URLs were generated or used.

