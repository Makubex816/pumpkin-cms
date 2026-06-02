# Corrected Untouched Route Guard

This document records the corrected guard behavior for the next Phase 8N homepage-only local draft overwrite retry.

## Purpose

The overwrite updates only route `/`. The untouched-route guard must prove `/contact` and `/service-areas` remain unchanged, but it must not require `/service-areas` to exist before that page has been imported.

## Route Rules

| Route | Accepted before state | Accepted after state | Blocks overwrite? |
| --- | --- | --- | --- |
| `/contact` | HTTP 200 with capturable baseline | Same reachable baseline after overwrite | Yes, if unreachable or changed |
| `/service-areas` | HTTP 200 or HTTP 404 | Same baseline after overwrite | No for 404; yes for transport failure or changed state |

For the current project state, `/service-areas` HTTP 404 means `expected-not-found`.

## Helper

Use:

```powershell
node tools/phase8n-homepage-overwrite/untouched-route-guard.mjs --print-rules
node tools/phase8n-homepage-overwrite/untouched-route-guard.mjs --self-test
node tools/phase8n-homepage-overwrite/untouched-route-guard.mjs --before before-routes.json --after after-routes.json
```

The helper is non-mutating. It validates snapshot JSON only and does not require admin JWT, read protected config, call write APIs, regenerate static output, deploy, or touch RollerRinkRentals.com.

## Retry Requirement

The next authenticated overwrite runner should capture route status/hash snapshots before and after the homepage update, then compare them with these rules.

If `/service-areas` is 404 before the write and still 404 after the write, the untouched-route guard passes for `/service-areas`.
