# Fresh Public DNS Readback

Snapshot window: `2026-07-14T02:17:55.6628890Z` through `2026-07-14T02:18:03.3040927Z`.

Cloudflare `1.1.1.1`, Google `8.8.8.8`, and Quad9 `9.9.9.9` were queried for NS, SOA, A, AAAA, CNAME, TXT, MX, CAA, and DS for both the apex and `www`. All 54 GET-based queries completed with zero errors.

| Record | Agreed result |
| --- | --- |
| Apex NS | `ns49.domaincontrol.com`, `ns50.domaincontrol.com` |
| Apex SOA | DomainControl/Jomax SOA, serial `2026062700` |
| Apex A | `3.33.130.190`, `15.197.148.33` |
| WWW CNAME | `stripclubnearmevegas.com` |
| WWW effective A | `3.33.130.190`, `15.197.148.33` |
| Apex AAAA/TXT/MX/CAA/DS | none |

Resolver agreement passed. Email DNS remains `no_email_records_detected`, no parent DS blocker was detected, and delegation remains `domaincontrol_manual_change_pending`.
