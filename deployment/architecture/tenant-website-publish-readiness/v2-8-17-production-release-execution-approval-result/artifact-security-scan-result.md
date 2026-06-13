# Artifact Security Scan Result

Status: passed.

| Scan | Result |
| --- | --- |
| High-confidence secret-like matches | `0` |
| Forbidden artifact path matches | `0` |
| Required route files | present |
| Required artifact files | present |
| Localhost matches | `1` |

The single localhost match was:

```text
_next/static/chunks/polyfills-42372ed130431b0a.js
```

This is classified as the standard Next.js polyfill bundle warning, not a config leak. No deployment token, API key, connection string, SAS, private key, protected config, or credential material was found or printed.

