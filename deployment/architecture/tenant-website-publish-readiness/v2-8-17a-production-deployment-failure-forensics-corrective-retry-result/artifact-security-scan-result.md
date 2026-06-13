# Artifact Security Scan Result

Status: passed.

Artifact root:

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613020714/repo/apps/ice-rink-web/out
```

Scan result:

| Field | Value |
| --- | --- |
| File count | `41` |
| Aggregate SHA-256 | `bc48cad4d1b23721781e97b8690b85bef12861450b5ca6c9df8f159dffe71044` |
| Hash method | `sha256(sorted relative path + NUL + per-file sha256 + newline)` |
| Required files missing | `0` |
| Forbidden artifact config files | `0` |
| High-confidence secret-like matches | `0` |
| Localhost matches | `1` |

Localhost match:

```text
_next/static/chunks/polyfills-42372ed130431b0a.js
```

Classification: standard Next polyfill bundle warning, not a config leak.
