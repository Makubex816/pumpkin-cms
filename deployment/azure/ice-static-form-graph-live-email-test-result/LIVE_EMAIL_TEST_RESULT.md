# Live Email Test Result

Generated: 2026-06-06

## Endpoint Result

| Field | Value |
| --- | --- |
| submitted at UTC | `2026-06-06T02:53:16.896Z` |
| valid payload attempts in graph mode | `1` |
| endpoint status | `200` |
| endpoint response `ok` | true |
| response message present | true |
| entry id present | true |
| entry id prefix | `ice-rink-rentals-default-quote-request-c8eb974a-` |
| response secret-pattern scan | clean |

Endpoint success in graph mode means the Microsoft Graph `sendMail` call returned `202 Accepted`; otherwise the handler returns an error.

## Delivery Evidence

Read-only Exchange message trace metadata:

| Field | Value |
| --- | --- |
| sender | `Contact@iceskatingrinkrentals.com` |
| recipient | `Contact@iceskatingrinkrentals.com` |
| subject | `Ice rink rental lead: Ice Graph Delivery Test` |
| status | `Delivered` |
| message trace id | `94e8d3f8-748a-4a5e-2fb0-08dec376c3b7` |

Mailbox contents were not accessed.

