# Future Cloudflare DNS Plan

## Current State

`media.iceskatingrinkrentals.com` did not resolve in the local read-only DNS check.

No Cloudflare or DNS changes were made.

## Future Goal

Serve:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

from Azure Blob media stored in:

```text
iceskatingmedia / ice-rink-rentals-media
```

## Required Path Mapping

The public URL omits the Azure container segment. Future Cloudflare configuration must map:

```text
/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

to:

```text
/ice-rink-rentals-media/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Possible Cloudflare Implementations

Potential implementation paths for a later approved gate:

- Cloudflare Cloud Connector for Azure Blob Storage, plus URL Rewrite for the container segment
- proxied DNS plus Origin Rules for Host header/DNS override, plus URL Rewrite
- Cloudflare Worker for path rewrite and origin fetch

Cloudflare Cloud Connector is attractive for Option A because Cloudflare documents Azure Blob support and automatic host header handling, but it requires the object storage bucket/container to be publicly accessible.

## Validation Required After Future Changes

After future Cloudflare/DNS changes, validate:

- DNS resolves for `media.iceskatingrinkrentals.com`
- HTTPS certificate is valid for the media hostname
- all 9 production target URLs return `200`
- `Content-Type` is `image/png`
- immutable cache-control is preserved or intentionally overridden
- no target URL exposes the Azure storage account hostname
- no target URL requires a query string, SAS token, or cookie
- no unapproved DNS records changed

