# V2.8.1 Blocker Carryforward

V2.8.1 found these local Ice route blockers:

| V2.8.1 blocker | V2.8.2 result |
| --- | --- |
| Missing `/service-areas` in current seed-sites | repaired |
| Obsolete `/ice-rink-rentals` present in current seed-sites | removed |
| Obsolete `/events-holiday-activations` present in current seed-sites | removed |
| Theme navigation pointed at obsolete routes | repaired |
| Static output missing `service-areas/index.html` | repaired and validated |
| Static output included obsolete route folders | repaired and validated |
| Raw draft-preview output affected validation | `static-publish.mjs generate` removed excluded preview output paths |
| Static form endpoint missing in validation shell | public documented endpoint contract supplied for local validation only |

Carry-forward caveats:

- Next still auto-detected `.env.local` during `next build`; the file was not manually read or printed.
- Static source validation still reports 34 content-maturity warnings.
- Static artifact generation reports 35 quality warnings.
- No live CMS/API snapshot was refreshed.
- No deployment, DNS, indexing, or live publication was attempted.
