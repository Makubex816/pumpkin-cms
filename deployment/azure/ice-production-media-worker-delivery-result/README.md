# Ice Production Media Worker Delivery Result

Date: 2026-06-05

Primary site: IceSkatingRinkRentals.com

Paused site: RollerRinkRentals.com

Target host:

```text
media.iceskatingrinkrentals.com
```

## Scope

This package documents the approved Cloudflare Worker media-delivery retry for Ice media only.

Approved Worker route scope:

```text
media.iceskatingrinkrentals.com/ice-rink-rentals/assets/*
```

Locked public URL pattern:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Azure origin URL pattern:

```text
https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Result Summary

Cloudflare Worker media delivery was configured and validated.

Configured objects:

- proxied Cloudflare DNS CNAME for `media.iceskatingrinkrentals.com`
- Worker script `ice-media-delivery`
- Worker route `media.iceskatingrinkrentals.com/ice-rink-rentals/assets/*`

Public validation:

```text
media.iceskatingrinkrentals.com DNS: resolves through Cloudflare
Cloudflare Worker public media URLs: 9/9 passed
HTTP status: 200 OK for 9/9
content type: image/png for 9/9
content length: matched expected values for 9/9
cache-control: public, max-age=31536000, immutable for 9/9
redirects: none
```

## Retry History

Prior rule-based Cloudflare media delivery was blocked by the HostHeader override entitlement.

The first Worker attempt was blocked by the active token:

```text
GET /zones/{zone_id}/workers/routes: HTTP 403
GET /accounts/{account_id}/workers/scripts: HTTP 403
```

This retry used the Worker-capable Cloudflare token from the active shell. The Worker route and script endpoints were readable, and the scoped setup completed.

## Azure Origin Status

Direct anonymous Azure Blob URL recheck passed:

```text
9/9 HTTP 200 OK
content type: image/png
content length: matched expected values
cache-control: public, max-age=31536000, immutable
```

No Azure access changes were made. No keys, connection strings, or SAS URLs were used or printed.

## What Was Not Done

This run did not:

- change root/apex DNS
- change `www` DNS
- change MX/TXT/email DNS
- write CMS records
- write MediaAsset records
- deploy static or production artifacts
- read protected config
- print secret values
- print Cloudflare tokens
- print Azure tokens
- print storage keys
- print connection strings
- generate SAS URLs
- upload, delete, or move blobs
- change Azure storage account or container access settings
- stage raw images
- stage generated static artifacts
- send email
- touch Microsoft 365 settings
- touch Roller

## Files

- `WORKER_PREFLIGHT.md`
- `PRE_CHANGE_DNS_HTTP_CHECK.md`
- `WORKER_IMPLEMENTATION.md`
- `CLOUDFLARE_DNS_RESULT.md`
- `WORKER_ROUTE_RESULT.md`
- `POST_CHANGE_PUBLIC_URL_VALIDATION.md`
- `PUBLIC_MEDIA_URL_WORKLIST.md`
- `REMAINING_MEDIA_DELIVERY_BLOCKERS.md`
- `NEXT_MEDIAASSET_UPDATE_APPROVAL_REQUIRED.md`
- `ROLLBACK_NOTES.md`
- `manifest.json`
- `worker/index.mjs`
