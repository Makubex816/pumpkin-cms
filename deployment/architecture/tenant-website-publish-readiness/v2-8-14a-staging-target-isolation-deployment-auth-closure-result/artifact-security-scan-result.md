# Artifact Security Scan Result

Artifact root:

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612225811/repo/apps/ice-rink-web/out
```

Scan result:

| Check | Result |
| --- | --- |
| File count | `41` |
| Aggregate SHA-256 | `e0eb1a62a9bce21f8435d272e176ec4f8df5fe65f921367fe2ac53c951624679` |
| High-confidence secret-like matches | `0` |
| Forbidden artifact path matches | `0` |
| Required routes present | `true` |
| Required files present | `true` |
| Localhost file matches | `1` |

The one localhost match is `_next/static/chunks/polyfills-42372ed130431b0a.js`, matching the standard Next polyfill warning carried from prior validation. It was not classified as protected config or a secret leak.

