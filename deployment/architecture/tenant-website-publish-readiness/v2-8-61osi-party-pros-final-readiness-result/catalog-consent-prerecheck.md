# Catalog and Consent Prerecheck

Fresh GET-only check at `2026-07-10T19:07:21.592Z`:

- routes checked: 16;
- HTTP 200: 16;
- missing Catalog navigation links: 0;
- contact fallback card links: 0;
- local-path markers: 0;
- POST requests: 0.

Key apex and `www` results:

| Route | Status | Catalog nav | Cards | Contact fallbacks |
| --- | ---: | ---: | ---: | ---: |
| `/` | 200 | 1 | 24 | 0 |
| `/contact` | 200 | 1 | 0 | 0 |
| `/service-areas` | 200 | 1 | 0 | 0 |
| `/catalog` | 200 | 1 | 214 | 0 |
| `/carnival-games` | 200 | 1 | 20 | 0 |
| `/dunk-tank-rentals-philadelphia` | 200 | 1 | 0 | 0 |

Both live contact routes rendered one consent checkbox and an enabled submit button. This prerecheck used GET only and completed before the controlled submission.

