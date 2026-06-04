# Media URL Contract

Production media URLs must be stable, content-addressed, and CDN-safe.

Required public URL pattern:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Contract rules:

- `{assetId}` identifies the approved MediaAsset.
- `{checksum}` versions the binary content.
- `{safeFileName}` is sanitized and extension-preserving.
- URLs must not contain localhost.
- URLs must not contain fake domains.
- URLs must not use base64.
- URLs must not point to random external providers.
- URLs must be approved before static generation.
- Required media must have a production `publicUrl` before launch.

Cache implication:

- Checksum-versioned paths can use long-lived immutable cache headers.
- Replacing media creates a new checksum/versioned path instead of mutating the old path.
- Old media URLs should remain available through rollback windows.
