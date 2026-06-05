# Cache Rule Result

Date: 2026-06-05

## Desired Cache Behavior

The 9 approved Azure Blob media files already carry:

```text
Cache-Control: public, max-age=31536000, immutable
```

The intended Cloudflare cache behavior was to cache query-free checksum-versioned media paths under:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/
```

while respecting the origin immutable TTL.

## Result

Cloudflare cache behavior was not configured.

Reason:

```text
The full safe delivery path was blocked before DNS/rule setup because Cloudflare is not entitled to use the required Origin Rule HostHeader override.
```

No cache settings rule was created.

## Current State

```text
Azure origin cache header: public, max-age=31536000, immutable
Cloudflare media cache rule configured: no
```

## No-Action Confirmation

No Cloudflare cache settings were changed.
