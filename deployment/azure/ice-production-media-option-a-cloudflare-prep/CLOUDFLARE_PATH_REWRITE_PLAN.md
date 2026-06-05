# Cloudflare Path Rewrite Plan

## Problem

The browser-facing target URL omits the Azure Blob container segment:

```text
/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

The Azure Blob origin requires the container segment:

```text
/ice-rink-rentals-media/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

A DNS CNAME alone cannot satisfy this path shape.

## Future Rewrite

Future Cloudflare configuration must transform:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

to the Azure origin fetch path:

```text
https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Candidate Cloudflare Controls

Use one approved future path:

- Cloudflare Cloud Connector plus URL Rewrite
- proxied DNS plus Origin Rules and URL Rewrite
- Cloudflare Worker only if rewrite/routing cannot be expressed with rules

## Validation

After future execution, all 9 public media URLs must return:

- HTTP `200`
- `Content-Type: image/png`
- no SAS query string
- no redirect to an Azure storage hostname
- expected cache policy

