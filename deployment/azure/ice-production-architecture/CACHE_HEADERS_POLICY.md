# Cache Headers Policy

Versioned image URLs:

```text
Cache-Control: public, max-age=31536000, immutable
```

Use this for checksum-versioned media paths:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Mutable manifests or indexes, if any:

- Use short TTL or no-cache depending on runtime behavior.
- Do not use immutable caching for mutable metadata.
- Validate Cloudflare cache rules before launch.

Cloudflare policy:

- Cache media subdomain image assets.
- Use cache rules for `media.iceskatingrinkrentals.com/*`.
- Purge should not be needed for checksum-versioned paths.
- Keep an emergency purge procedure for production incidents.

Static site policy:

- HTML and app shell cache behavior must support rollback and fresh deploy visibility.
- Static asset fingerprinting should drive long-lived cache where safe.
