# Graph Live Test Review

Generated: 2026-06-06

## Live Test Summary

| Field | Value |
| --- | --- |
| test run id | `ice-graph-live-20260606025316` |
| submitted at UTC | `2026-06-06T02:53:16.896Z` |
| valid graph-mode payload attempts | `1` |
| endpoint status | `200` |
| endpoint response `ok` | true |
| entry id present | true |
| response secret-pattern scan | clean |
| Exchange message trace status | `Delivered` |
| message trace id | `94e8d3f8-748a-4a5e-2fb0-08dec376c3b7` |

## Interpretation

The endpoint response proves the Function accepted the payload. In graph mode, this handler returns success only after Microsoft Graph `sendMail` returns `202 Accepted`.

Exchange message trace metadata also reported the message as `Delivered`.

## Remaining Confirmation

Mailbox contents were not accessed. Human inbox confirmation is still required before enabling ongoing production Graph delivery.

