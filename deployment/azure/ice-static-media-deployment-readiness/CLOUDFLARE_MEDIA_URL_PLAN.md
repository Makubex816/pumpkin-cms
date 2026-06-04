# Cloudflare Media URL Plan

## Target

Production and staging media should be served through:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Intended Path

```text
Browser
  -> Cloudflare media hostname
  -> Azure Blob Storage origin
```

## Cache Guidance

Checksum-versioned image paths should be eligible for long-lived immutable caching after the Blob and Cloudflare path is validated.

Mutable manifests, if any are added later, should use short TTL or no-cache behavior.

## DNS And Cloudflare Status

- Cloudflare media hostname configured: no
- DNS changed: no
- Cloudflare rules changed: no
- Cache purge run: no
- Blob origin configured: no

## Readiness Result

Ready for production media URLs: no.

Cloudflare media routing must wait until Blob storage is provisioned, uploaded assets are verified, and MediaAsset metadata is updated through a separately approved task.

