# Media Public URL Readback Proof

Result: passed.

Method: public unauthenticated HEAD readback for each MediaAsset URL.

Expected count: 13.

Readback result:

| Asset ID | Status |
| --- | --- |
| `pkg-throttle` | HTTP 200 |
| `pkg-skyline` | HTTP 200 |
| `pkg-runway` | HTTP 200 |
| `pkg-party-10` | HTTP 200 |
| `pkg-onehour` | HTTP 200 |
| `pkg-duo` | HTTP 200 |
| `pkg-champagne` | HTTP 200 |
| `pkg-cabin` | HTTP 200 |
| `logo-wordmark` | HTTP 200 |
| `logo-full` | HTTP 200 |
| `hero` | HTTP 200 |
| `fathers-day-thumb` | HTTP 200 |
| `airstrip-location-map` | HTTP 200 |

All readbacks matched the Airstrip public blob prefix. No storage keys, listKeys, SAS, upload, delete, or storage mutation was used.
