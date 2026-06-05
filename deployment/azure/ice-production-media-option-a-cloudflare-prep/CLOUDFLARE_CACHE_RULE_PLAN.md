# Cloudflare Cache Rule Plan

## Goal

Cache checksum-versioned media aggressively at Cloudflare while preserving the existing immutable asset policy.

## Origin Cache Header

Uploaded blobs were configured with:

```text
Cache-Control: public, max-age=31536000, immutable
```

## Future Cloudflare Cache Behavior

Future Cloudflare execution should:

- respect the origin cache-control header where possible
- cache `.png` media paths under `/ice-rink-rentals/assets/`
- avoid caching error responses during setup
- avoid caching any SAS or query-string variant
- purge only if needed during validation

## Not Done

No cache rule was created.

