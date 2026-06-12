# Artifact Security Scan Result

Artifact root:

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612233427/repo/apps/ice-rink-web/out
```

Scan result:

| Check | Result |
| --- | --- |
| File count | `41` |
| Aggregate SHA-256 | `3e34dd29a7d91a623fd698f788d4ce86066c4dabf643bb1ec25fe04ea8cf32e8` |
| High-confidence secret-like matches | `0` |
| Forbidden artifact path matches | `0` |
| Required routes present | `true` |
| Required files present | `true` |
| Localhost file matches | `1` |

The one localhost match is `_next/static/chunks/polyfills-42372ed130431b0a.js`, matching the standard Next polyfill warning. It is not classified as protected config or a secret leak.

