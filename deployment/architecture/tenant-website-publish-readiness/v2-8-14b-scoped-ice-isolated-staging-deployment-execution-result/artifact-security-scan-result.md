# Artifact Security Scan Result

Artifact root:

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612231928/repo/apps/ice-rink-web/out
```

Scan result:

| Check | Result |
| --- | --- |
| File count | `41` |
| Aggregate SHA-256 | `7e83c6c66d24f9087e74c77ee2eb958fdcb18a54893172ef9e8fb9410f399a82` |
| High-confidence secret-like matches | `0` |
| Forbidden artifact path matches | `0` |
| Required routes present | `true` |
| Required files present | `true` |
| Localhost file matches | `1` |

The one localhost match is `_next/static/chunks/polyfills-42372ed130431b0a.js`, matching the standard Next polyfill warning. It is not classified as protected config or a secret leak.

